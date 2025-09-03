package com.shopifygenie.controller;

import com.shopifygenie.entity.ShopifyConfig;
import com.shopifygenie.entity.User;
import com.shopifygenie.service.ShopifyConfigService;
import com.shopifygenie.service.ShopifyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/shopify")
@Tag(name = "Shopify API", description = "Shopify API integration endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ShopifyController {
    
    @Autowired
    private ShopifyService shopifyService;
    
    @Autowired
    private ShopifyConfigService shopifyConfigService;
    
    @GetMapping("/products")
    @Operation(summary = "Get products from Shopify", description = "Fetches products from the user's Shopify store")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) String shopDomain,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String pageInfo,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.getConfigByShopDomain(user, shopDomain);
        
        return shopifyService.getProducts(config, limit, pageInfo)
                .map(ResponseEntity::ok)
                .block();
    }
    
    @PostMapping("/products")
    @Operation(summary = "Create product in Shopify", description = "Creates a new product in the user's Shopify store")
    public ResponseEntity<Map<String, Object>> createProduct(
            @RequestParam String shopDomain,
            @RequestBody Map<String, Object> productData,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.getConfigByShopDomain(user, shopDomain);
        
        return shopifyService.createProduct(config, productData)
                .map(ResponseEntity::ok)
                .block();
    }
    
    @PutMapping("/products/{productId}")
    @Operation(summary = "Update product in Shopify", description = "Updates an existing product in the user's Shopify store")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Long productId,
            @RequestParam String shopDomain,
            @RequestBody Map<String, Object> productData,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.getConfigByShopDomain(user, shopDomain);
        
        return shopifyService.updateProduct(config, productId, productData)
                .map(ResponseEntity::ok)
                .block();
    }
    
    @GetMapping("/orders")
    @Operation(summary = "Get orders from Shopify", description = "Fetches orders from the user's Shopify store")
    public ResponseEntity<Map<String, Object>> getOrders(
            @RequestParam(required = false) String shopDomain,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String pageInfo,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.getConfigByShopDomain(user, shopDomain);
        
        return shopifyService.getOrders(config, limit, pageInfo)
                .map(ResponseEntity::ok)
                .block();
    }
    
    @PostMapping("/orders")
    @Operation(summary = "Create order in Shopify", description = "Creates a new order in the user's Shopify store")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestParam String shopDomain,
            @RequestBody Map<String, Object> orderData,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.getConfigByShopDomain(user, shopDomain);
        
        return shopifyService.createOrder(config, orderData)
                .map(ResponseEntity::ok)
                .block();
    }
    
    @GetMapping("/customers")
    @Operation(summary = "Get customers from Shopify", description = "Fetches customers from the user's Shopify store")
    public ResponseEntity<Map<String, Object>> getCustomers(
            @RequestParam(required = false) String shopDomain,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String pageInfo,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.getConfigByShopDomain(user, shopDomain);
        
        return shopifyService.getCustomers(config, limit, pageInfo)
                .map(ResponseEntity::ok)
                .block();
    }
    
    @PostMapping("/graphql")
    @Operation(summary = "Execute GraphQL query", description = "Executes a GraphQL query against the user's Shopify store")
    public ResponseEntity<Map<String, Object>> executeGraphQL(
            @RequestParam String shopDomain,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.getConfigByShopDomain(user, shopDomain);
        
        String query = (String) request.get("query");
        @SuppressWarnings("unchecked")
        Map<String, Object> variables = (Map<String, Object>) request.get("variables");
        
        return shopifyService.executeGraphQL(config, query, variables)
                .map(ResponseEntity::ok)
                .block();
    }
}
