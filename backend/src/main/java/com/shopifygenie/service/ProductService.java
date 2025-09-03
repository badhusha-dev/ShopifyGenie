package com.shopifygenie.service;

import com.shopifygenie.dto.ProductRequest;
import com.shopifygenie.entity.Product;
import com.shopifygenie.entity.ShopifyConfig;
import com.shopifygenie.entity.User;
import com.shopifygenie.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class ProductService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ShopifyConfigService shopifyConfigService;
    
    @Autowired
    private ShopifyService shopifyService;
    
    public List<Product> getUserProducts(User user) {
        return productRepository.findByUserAndIsActiveTrue(user);
    }
    
    public Page<Product> getUserProducts(User user, Pageable pageable) {
        return productRepository.findByUserAndIsActiveTrue(user, pageable);
    }
    
    public Product getProductById(User user, Long productId) {
        return productRepository.findById(productId)
                .filter(product -> product.getUser().getId().equals(user.getId()) && product.isActive())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
    }
    
    public Product createProduct(User user, ProductRequest request) {
        // Check if product name already exists for this user
        if (productRepository.existsByUserAndNameAndIsActiveTrue(user, request.getName())) {
            throw new RuntimeException("Product with name '" + request.getName() + "' already exists");
        }
        
        Product product = new Product();
        product.setUser(user);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setActive(true);
        
        Product savedProduct = productRepository.save(product);
        
        // If user has Shopify config, sync to Shopify
        try {
            Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
            if (shopifyConfig.isPresent()) {
                syncProductToShopify(savedProduct, shopifyConfig.get());
            }
        } catch (Exception e) {
            logger.error("Failed to sync product to Shopify", e);
            // Don't fail the operation if Shopify sync fails
        }
        
        return savedProduct;
    }
    
    public Product updateProduct(User user, Long productId, ProductRequest request) {
        Product product = getProductById(user, productId);
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        
        Product updatedProduct = productRepository.save(product);
        
        // If user has Shopify config, sync to Shopify
        try {
            Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
            if (shopifyConfig.isPresent() && product.getShopifyProductId() != null) {
                syncProductUpdateToShopify(updatedProduct, shopifyConfig.get());
            }
        } catch (Exception e) {
            logger.error("Failed to sync product update to Shopify", e);
        }
        
        return updatedProduct;
    }
    
    public void deleteProduct(User user, Long productId) {
        Product product = getProductById(user, productId);
        product.setActive(false);
        productRepository.save(product);
        
        // If user has Shopify config, sync to Shopify
        try {
            Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
            if (shopifyConfig.isPresent() && product.getShopifyProductId() != null) {
                // Note: Shopify doesn't support product deletion via API, so we just mark as inactive
                logger.info("Product marked as inactive. Shopify product deletion not supported via API.");
            }
        } catch (Exception e) {
            logger.error("Failed to handle Shopify product deletion", e);
        }
    }
    
    public List<Product> searchProducts(User user, String searchTerm) {
        return productRepository.findByUserAndSearchTerm(user, searchTerm);
    }
    
    public List<Product> getProductsByCategory(User user, String category) {
        return productRepository.findByUserAndCategoryAndIsActiveTrue(user, category);
    }
    
    private void syncProductToShopify(Product product, ShopifyConfig config) {
        try {
            Map<String, Object> productData = Map.of(
                    "title", product.getName(),
                    "body_html", product.getDescription() != null ? product.getDescription() : "",
                    "vendor", "ShopifyGenie",
                    "product_type", product.getCategory() != null ? product.getCategory() : "General",
                    "variants", List.of(Map.of(
                            "price", product.getPrice().toString(),
                            "inventory_quantity", product.getStock(),
                            "inventory_management", "shopify"
                    ))
            );
            
            shopifyService.createProduct(config, productData)
                    .subscribe(
                            response -> {
                                if (response.containsKey("product")) {
                                    Map<String, Object> shopifyProduct = (Map<String, Object>) response.get("product");
                                    String shopifyProductId = shopifyProduct.get("id").toString();
                                    String shopifyVariantId = ((List<Map<String, Object>>) shopifyProduct.get("variants")).get(0).get("id").toString();
                                    
                                    product.setShopifyProductId(shopifyProductId);
                                    product.setShopifyVariantId(shopifyVariantId);
                                    productRepository.save(product);
                                    
                                    logger.info("Product synced to Shopify with ID: {}", shopifyProductId);
                                }
                            },
                            error -> logger.error("Failed to sync product to Shopify", error)
                    );
        } catch (Exception e) {
            logger.error("Error syncing product to Shopify", e);
        }
    }
    
    private void syncProductUpdateToShopify(Product product, ShopifyConfig config) {
        try {
            Map<String, Object> variantData = Map.of(
                    "variant", Map.of(
                            "id", product.getShopifyVariantId(),
                            "price", product.getPrice().toString(),
                            "inventory_quantity", product.getStock()
                    )
            );
            
            // Update variant
            shopifyService.updateProduct(config, Long.parseLong(product.getShopifyProductId()), variantData)
                    .subscribe(
                            response -> logger.info("Product updated in Shopify"),
                            error -> logger.error("Failed to update product in Shopify", error)
                    );
        } catch (Exception e) {
            logger.error("Error updating product in Shopify", e);
        }
    }
    
    public void syncFromShopify(User user) {
        Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
        if (shopifyConfig.isEmpty()) {
            throw new RuntimeException("No Shopify configuration found for user");
        }
        
        shopifyService.getProducts(shopifyConfig.get(), 250, null)
                .subscribe(
                        response -> {
                            if (response.containsKey("products")) {
                                List<Map<String, Object>> shopifyProducts = (List<Map<String, Object>>) response.get("products");
                                for (Map<String, Object> shopifyProduct : shopifyProducts) {
                                    syncShopifyProductToLocal(user, shopifyProduct);
                                }
                            }
                        },
                        error -> logger.error("Failed to sync products from Shopify", error)
                );
    }
    
    private void syncShopifyProductToLocal(User user, Map<String, Object> shopifyProduct) {
        try {
            String shopifyProductId = shopifyProduct.get("id").toString();
            String title = (String) shopifyProduct.get("title");
            String bodyHtml = (String) shopifyProduct.get("body_html");
            
            List<Map<String, Object>> variants = (List<Map<String, Object>>) shopifyProduct.get("variants");
            if (!variants.isEmpty()) {
                Map<String, Object> variant = variants.get(0);
                String shopifyVariantId = variant.get("id").toString();
                BigDecimal price = new BigDecimal(variant.get("price").toString());
                Integer inventoryQuantity = (Integer) variant.get("inventory_quantity");
                
                // Check if product already exists
                Optional<Product> existingProduct = productRepository.findByUserAndShopifyProductId(user, shopifyProductId);
                
                if (existingProduct.isPresent()) {
                    // Update existing product
                    Product product = existingProduct.get();
                    product.setName(title);
                    product.setDescription(bodyHtml);
                    product.setPrice(price);
                    product.setStock(inventoryQuantity);
                    productRepository.save(product);
                } else {
                    // Create new product
                    Product product = new Product();
                    product.setUser(user);
                    product.setName(title);
                    product.setDescription(bodyHtml);
                    product.setPrice(price);
                    product.setStock(inventoryQuantity);
                    product.setShopifyProductId(shopifyProductId);
                    product.setShopifyVariantId(shopifyVariantId);
                    product.setActive(true);
                    productRepository.save(product);
                }
            }
        } catch (Exception e) {
            logger.error("Error syncing Shopify product to local", e);
        }
    }
}
