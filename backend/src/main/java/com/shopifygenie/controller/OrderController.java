package com.shopifygenie.controller;

import com.shopifygenie.dto.OrderRequest;
import com.shopifygenie.entity.Order;
import com.shopifygenie.entity.User;
import com.shopifygenie.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/orders")
@Tag(name = "Orders", description = "Order management APIs")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @GetMapping
    @Operation(summary = "Get user's orders", description = "Retrieves all orders for the authenticated user")
    public ResponseEntity<List<Order>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        if (page == 0 && size == 20) {
            // Return all orders without pagination
            List<Order> orders = orderService.getUserOrders(user);
            return ResponseEntity.ok(orders);
        } else {
            // Return paginated orders
            Pageable pageable = PageRequest.of(page, size);
            Page<Order> orderPage = orderService.getUserOrders(user, pageable);
            return ResponseEntity.ok(orderPage.getContent());
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieves a specific order by ID")
    public ResponseEntity<Order> getOrder(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Order order = orderService.getOrderById(user, id);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping
    @Operation(summary = "Create order", description = "Creates a new order")
    public ResponseEntity<Order> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Order order = orderService.createOrder(user, request);
        return ResponseEntity.ok(order);
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Updates the status of an order")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Order order = orderService.updateOrderStatus(user, id, status);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel order", description = "Cancels an order and restores product stock")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        orderService.cancelOrder(user, id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get orders by status", description = "Retrieves orders filtered by status")
    public ResponseEntity<List<Order>> getOrdersByStatus(
            @PathVariable Order.OrderStatus status,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        List<Order> orders = orderService.getOrdersByStatus(user, status);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get orders by customer", description = "Retrieves orders for a specific customer")
    public ResponseEntity<List<Order>> getOrdersByCustomer(
            @PathVariable Long customerId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        List<Order> orders = orderService.getOrdersByCustomer(user, customerId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/date-range")
    @Operation(summary = "Get orders by date range", description = "Retrieves orders within a date range")
    public ResponseEntity<List<Order>> getOrdersByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime start = LocalDateTime.parse(startDate, formatter);
        LocalDateTime end = LocalDateTime.parse(endDate, formatter);
        
        List<Order> orders = orderService.getOrdersByDateRange(user, start, end);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/stats/count/{status}")
    @Operation(summary = "Get order count by status", description = "Returns the count of orders by status")
    public ResponseEntity<Long> getOrderCountByStatus(
            @PathVariable Order.OrderStatus status,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Long count = orderService.getOrderCountByStatus(user, status);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/stats/revenue/{status}")
    @Operation(summary = "Get total revenue by status", description = "Returns the total revenue for orders by status")
    public ResponseEntity<Double> getTotalRevenueByStatus(
            @PathVariable Order.OrderStatus status,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Double revenue = orderService.getTotalRevenueByStatus(user, status);
        return ResponseEntity.ok(revenue);
    }
    
    @PostMapping("/sync/shopify")
    @Operation(summary = "Sync orders from Shopify", description = "Syncs orders from Shopify to local database")
    public ResponseEntity<String> syncFromShopify(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        orderService.syncFromShopify(user);
        return ResponseEntity.ok("Order sync initiated successfully");
    }
}
