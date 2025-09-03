package com.shopifygenie.controller;

import com.shopifygenie.util.WebhookValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/webhooks")
@Tag(name = "Webhooks", description = "Shopify webhook endpoints")
public class WebhookController {
    
    private static final Logger logger = LoggerFactory.getLogger(WebhookController.class);
    
    @Autowired
    private WebhookValidator webhookValidator;
    
    @PostMapping("/orders/create")
    @Operation(summary = "Handle order creation webhook", description = "Processes Shopify order creation webhook")
    public ResponseEntity<String> handleOrderCreate(@RequestBody String body,
                                                  @RequestHeader("X-Shopify-Hmac-Sha256") String hmacHeader,
                                                  @RequestHeader("X-Shopify-Shop-Domain") String shopDomain,
                                                  @RequestHeader("X-Shopify-Topic") String topic) {
        
        logger.info("Received order creation webhook from shop: {}", shopDomain);
        
        if (!webhookValidator.validateWebhook(body, hmacHeader)) {
            logger.warn("Invalid webhook signature for shop: {}", shopDomain);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
        }
        
        try {
            // Process the order creation webhook
            logger.info("Processing order creation webhook for shop: {}", shopDomain);
            // TODO: Implement order processing logic to sync to local database
            // This would involve:
            // 1. Finding the user by shop domain
            // 2. Parsing the order data from the webhook
            // 3. Creating/updating the order in local database
            
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            logger.error("Error processing order creation webhook for shop: {}", shopDomain, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
        }
    }
    
    @PostMapping("/products/update")
    @Operation(summary = "Handle product update webhook", description = "Processes Shopify product update webhook")
    public ResponseEntity<String> handleProductUpdate(@RequestBody String body,
                                                    @RequestHeader("X-Shopify-Hmac-Sha256") String hmacHeader,
                                                    @RequestHeader("X-Shopify-Shop-Domain") String shopDomain,
                                                    @RequestHeader("X-Shopify-Topic") String topic) {
        
        logger.info("Received product update webhook from shop: {}", shopDomain);
        
        if (!webhookValidator.validateWebhook(body, hmacHeader)) {
            logger.warn("Invalid webhook signature for shop: {}", shopDomain);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
        }
        
        try {
            // Process the product update webhook
            logger.info("Processing product update webhook for shop: {}", shopDomain);
            // TODO: Implement product update processing logic to sync to local database
            // This would involve:
            // 1. Finding the user by shop domain
            // 2. Parsing the product data from the webhook
            // 3. Updating the product in local database
            
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            logger.error("Error processing product update webhook for shop: {}", shopDomain, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
        }
    }
    
    @PostMapping("/customers/create")
    @Operation(summary = "Handle customer creation webhook", description = "Processes Shopify customer creation webhook")
    public ResponseEntity<String> handleCustomerCreate(@RequestBody String body,
                                                     @RequestHeader("X-Shopify-Hmac-Sha256") String hmacHeader,
                                                     @RequestHeader("X-Shopify-Shop-Domain") String shopDomain,
                                                     @RequestHeader("X-Shopify-Topic") String topic) {
        
        logger.info("Received customer creation webhook from shop: {}", shopDomain);
        
        if (!webhookValidator.validateWebhook(body, hmacHeader)) {
            logger.warn("Invalid webhook signature for shop: {}", shopDomain);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
        }
        
        try {
            // Process the customer creation webhook
            logger.info("Processing customer creation webhook for shop: {}", shopDomain);
            // TODO: Implement customer creation processing logic
            
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            logger.error("Error processing customer creation webhook for shop: {}", shopDomain, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
        }
    }
    
    @PostMapping("/app/uninstalled")
    @Operation(summary = "Handle app uninstall webhook", description = "Processes Shopify app uninstall webhook")
    public ResponseEntity<String> handleAppUninstall(@RequestBody String body,
                                                   @RequestHeader("X-Shopify-Hmac-Sha256") String hmacHeader,
                                                   @RequestHeader("X-Shopify-Shop-Domain") String shopDomain,
                                                   @RequestHeader("X-Shopify-Topic") String topic) {
        
        logger.info("Received app uninstall webhook from shop: {}", shopDomain);
        
        if (!webhookValidator.validateWebhook(body, hmacHeader)) {
            logger.warn("Invalid webhook signature for shop: {}", shopDomain);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
        }
        
        try {
            // Process the app uninstall webhook
            logger.info("Processing app uninstall webhook for shop: {}", shopDomain);
            // TODO: Implement app uninstall processing logic (e.g., deactivate shop config)
            
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            logger.error("Error processing app uninstall webhook for shop: {}", shopDomain, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
        }
    }
}
