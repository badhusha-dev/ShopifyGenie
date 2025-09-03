package com.shopifygenie.controller;

import com.shopifygenie.dto.ShopifyConfigRequest;
import com.shopifygenie.entity.ShopifyConfig;
import com.shopifygenie.entity.User;
import com.shopifygenie.service.ShopifyConfigService;
import com.shopifygenie.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/config/shopify")
@Tag(name = "Shopify Configuration", description = "Shopify configuration management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ShopifyConfigController {
    
    @Autowired
    private ShopifyConfigService shopifyConfigService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    @Operation(summary = "Save Shopify configuration", description = "Saves Shopify credentials for the authenticated user")
    public ResponseEntity<ShopifyConfig> saveConfig(@Valid @RequestBody ShopifyConfigRequest request, 
                                                   Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.saveConfig(user, request);
        return ResponseEntity.ok(config);
    }
    
    @GetMapping
    @Operation(summary = "Get user's Shopify configurations", description = "Retrieves all Shopify configurations for the authenticated user")
    public ResponseEntity<List<ShopifyConfig>> getUserConfigs(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<ShopifyConfig> configs = shopifyConfigService.getUserConfigs(user);
        return ResponseEntity.ok(configs);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get specific Shopify configuration", description = "Retrieves a specific Shopify configuration by ID")
    public ResponseEntity<ShopifyConfig> getConfig(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.getConfigByIdAndUser(id, user);
        return ResponseEntity.ok(config);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update Shopify configuration", description = "Updates an existing Shopify configuration")
    public ResponseEntity<ShopifyConfig> updateConfig(@PathVariable Long id, 
                                                     @Valid @RequestBody ShopifyConfigRequest request,
                                                     Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        ShopifyConfig config = shopifyConfigService.updateConfig(id, user, request);
        return ResponseEntity.ok(config);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Shopify configuration", description = "Deletes a Shopify configuration")
    public ResponseEntity<Void> deleteConfig(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        shopifyConfigService.deleteConfig(id, user);
        return ResponseEntity.noContent().build();
    }
}
