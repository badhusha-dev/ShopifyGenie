package com.shopifygenie.service;

import com.shopifygenie.dto.OrderRequest;
import com.shopifygenie.entity.*;
import com.shopifygenie.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class OrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ShopifyConfigService shopifyConfigService;
    
    @Autowired
    private ShopifyService shopifyService;
    
    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public Page<Order> getUserOrders(User user, Pageable pageable) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }
    
    public Order getOrderById(User user, Long orderId) {
        return orderRepository.findById(orderId)
                .filter(order -> order.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }
    
    public Order createOrder(User user, OrderRequest request) {
        // Get customer
        Customer customer = customerService.getCustomerById(user, request.getCustomerId());
        
        // Calculate total and create order items
        BigDecimal total = BigDecimal.ZERO;
        Order order = new Order();
        order.setUser(user);
        order.setCustomer(customer);
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());
        order.setStatus(Order.OrderStatus.PENDING);
        
        // Process order items
        for (OrderRequest.OrderItemRequest itemRequest : request.getOrderItems()) {
            Product product = productService.getProductById(user, itemRequest.getProductId());
            
            // Check stock
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            // Create order item
            OrderItem orderItem = new OrderItem(product, itemRequest.getQuantity(), product.getPrice());
            order.addOrderItem(orderItem);
            
            // Update product stock
            product.setStock(product.getStock() - itemRequest.getQuantity());
            
            // Add to total
            total = total.add(orderItem.getTotalPrice());
        }
        
        order.setTotal(total);
        
        Order savedOrder = orderRepository.save(order);
        
        // If user has Shopify config, sync to Shopify
        try {
            Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
            if (shopifyConfig.isPresent()) {
                syncOrderToShopify(savedOrder, shopifyConfig.get());
            }
        } catch (Exception e) {
            logger.error("Failed to sync order to Shopify", e);
            // Don't fail the operation if Shopify sync fails
        }
        
        return savedOrder;
    }
    
    public Order updateOrderStatus(User user, Long orderId, Order.OrderStatus status) {
        Order order = getOrderById(user, orderId);
        order.setStatus(status);
        
        Order updatedOrder = orderRepository.save(order);
        
        // If user has Shopify config, sync status to Shopify
        try {
            Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
            if (shopifyConfig.isPresent() && order.getShopifyOrderId() != null) {
                syncOrderStatusToShopify(updatedOrder, shopifyConfig.get());
            }
        } catch (Exception e) {
            logger.error("Failed to sync order status to Shopify", e);
        }
        
        return updatedOrder;
    }
    
    public void cancelOrder(User user, Long orderId) {
        Order order = getOrderById(user, orderId);
        
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }
        
        // Restore product stock
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() + orderItem.getQuantity());
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        // If user has Shopify config, sync cancellation to Shopify
        try {
            Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
            if (shopifyConfig.isPresent() && order.getShopifyOrderId() != null) {
                syncOrderCancellationToShopify(order, shopifyConfig.get());
            }
        } catch (Exception e) {
            logger.error("Failed to sync order cancellation to Shopify", e);
        }
    }
    
    public List<Order> getOrdersByStatus(User user, Order.OrderStatus status) {
        return orderRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status);
    }
    
    public List<Order> getOrdersByCustomer(User user, Long customerId) {
        return orderRepository.findByUserAndCustomerIdOrderByCreatedAtDesc(user, customerId);
    }
    
    public List<Order> getOrdersByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByUserAndDateRange(user, startDate, endDate);
    }
    
    public Long getOrderCountByStatus(User user, Order.OrderStatus status) {
        return orderRepository.countByUserAndStatus(user, status);
    }
    
    public Double getTotalRevenueByStatus(User user, Order.OrderStatus status) {
        return orderRepository.sumTotalByUserAndStatus(user, status);
    }
    
    private void syncOrderToShopify(Order order, ShopifyConfig config) {
        try {
            // Build line items for Shopify
            List<Map<String, Object>> lineItems = order.getOrderItems().stream()
                    .map(item -> {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("variant_id", Long.parseLong(item.getProduct().getShopifyVariantId()));
                        itemMap.put("quantity", item.getQuantity());
                        return itemMap;
                    })
                    .toList();
            
            Map<String, Object> orderData = Map.of(
                    "order", Map.of(
                            "line_items", lineItems,
                            "customer", Map.of(
                                    "id", Long.parseLong(order.getCustomer().getShopifyCustomerId())
                            ),
                            "shipping_address", Map.of(
                                    "address1", order.getShippingAddress() != null ? order.getShippingAddress() : "",
                                    "city", "",
                                    "province", "",
                                    "country", "",
                                    "zip", ""
                            ),
                            "billing_address", Map.of(
                                    "address1", order.getBillingAddress() != null ? order.getBillingAddress() : "",
                                    "city", "",
                                    "province", "",
                                    "country", "",
                                    "zip", ""
                            ),
                            "financial_status", "pending",
                            "inventory_behaviour", "bypass"
                    )
            );
            
            shopifyService.createOrder(config, orderData)
                    .subscribe(
                            response -> {
                                if (response.containsKey("order")) {
                                    Map<String, Object> shopifyOrder = (Map<String, Object>) response.get("order");
                                    String shopifyOrderId = shopifyOrder.get("id").toString();
                                    
                                    order.setShopifyOrderId(shopifyOrderId);
                                    orderRepository.save(order);
                                    
                                    logger.info("Order synced to Shopify with ID: {}", shopifyOrderId);
                                }
                            },
                            error -> logger.error("Failed to sync order to Shopify", error)
                    );
        } catch (Exception e) {
            logger.error("Error syncing order to Shopify", e);
        }
    }
    
    private void syncOrderStatusToShopify(Order order, ShopifyConfig config) {
        try {
            String shopifyStatus = mapOrderStatusToShopify(order.getStatus());
            
            Map<String, Object> orderData = Map.of(
                    "order", Map.of(
                            "id", order.getShopifyOrderId(),
                            "financial_status", shopifyStatus
                    )
            );
            
            // Note: This would require an order update endpoint in ShopifyService
            logger.info("Would update order status in Shopify: {}", shopifyStatus);
        } catch (Exception e) {
            logger.error("Error updating order status in Shopify", e);
        }
    }
    
    private void syncOrderCancellationToShopify(Order order, ShopifyConfig config) {
        try {
            // Note: This would require an order cancellation endpoint in ShopifyService
            logger.info("Would cancel order in Shopify: {}", order.getShopifyOrderId());
        } catch (Exception e) {
            logger.error("Error cancelling order in Shopify", e);
        }
    }
    
    private String mapOrderStatusToShopify(Order.OrderStatus status) {
        return switch (status) {
            case PENDING -> "pending";
            case CONFIRMED -> "paid";
            case SHIPPED -> "paid";
            case DELIVERED -> "paid";
            case CANCELLED -> "refunded";
        };
    }
    
    public void syncFromShopify(User user) {
        Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
        if (shopifyConfig.isEmpty()) {
            throw new RuntimeException("No Shopify configuration found for user");
        }
        
        shopifyService.getOrders(shopifyConfig.get(), 250, null)
                .subscribe(
                        response -> {
                            if (response.containsKey("orders")) {
                                List<Map<String, Object>> shopifyOrders = (List<Map<String, Object>>) response.get("orders");
                                for (Map<String, Object> shopifyOrder : shopifyOrders) {
                                    syncShopifyOrderToLocal(user, shopifyOrder);
                                }
                            }
                        },
                        error -> logger.error("Failed to sync orders from Shopify", error)
                );
    }
    
    private void syncShopifyOrderToLocal(User user, Map<String, Object> shopifyOrder) {
        try {
            String shopifyOrderId = shopifyOrder.get("id").toString();
            String financialStatus = (String) shopifyOrder.get("financial_status");
            String total = shopifyOrder.get("total_price").toString();
            
            // Check if order already exists
            Optional<Order> existingOrder = orderRepository.findByUserAndShopifyOrderId(user, shopifyOrderId);
            
            if (existingOrder.isEmpty()) {
                // Create new order (simplified - would need to handle customer and line items)
                logger.info("Would create new order from Shopify: {}", shopifyOrderId);
            } else {
                // Update existing order status
                Order order = existingOrder.get();
                Order.OrderStatus status = mapShopifyStatusToOrderStatus(financialStatus);
                order.setStatus(status);
                orderRepository.save(order);
            }
        } catch (Exception e) {
            logger.error("Error syncing Shopify order to local", e);
        }
    }
    
    private Order.OrderStatus mapShopifyStatusToOrderStatus(String shopifyStatus) {
        return switch (shopifyStatus) {
            case "pending" -> Order.OrderStatus.PENDING;
            case "paid" -> Order.OrderStatus.CONFIRMED;
            case "refunded" -> Order.OrderStatus.CANCELLED;
            default -> Order.OrderStatus.PENDING;
        };
    }
}
