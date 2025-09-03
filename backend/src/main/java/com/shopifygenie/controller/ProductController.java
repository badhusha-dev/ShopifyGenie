package com.shopifygenie.controller;

import com.shopifygenie.dto.ProductRequest;
import com.shopifygenie.entity.Product;
import com.shopifygenie.entity.User;
import com.shopifygenie.service.ProductService;
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

import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Product management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    @Operation(summary = "Get user's products", description = "Retrieves all products for the authenticated user")
    public ResponseEntity<List<Product>> getUserProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        if (page == 0 && size == 20) {
            // Return all products without pagination
            List<Product> products = productService.getUserProducts(user);
            return ResponseEntity.ok(products);
        } else {
            // Return paginated products
            Pageable pageable = PageRequest.of(page, size);
            Page<Product> productPage = productService.getUserProducts(user, pageable);
            return ResponseEntity.ok(productPage.getContent());
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieves a specific product by ID")
    public ResponseEntity<Product> getProduct(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Product product = productService.getProductById(user, id);
        return ResponseEntity.ok(product);
    }
    
    @PostMapping
    @Operation(summary = "Create product", description = "Creates a new product")
    public ResponseEntity<Product> createProduct(
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Product product = productService.createProduct(user, request);
        return ResponseEntity.ok(product);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Updates an existing product")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Product product = productService.updateProduct(user, id, request);
        return ResponseEntity.ok(product);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product", description = "Deletes a product (marks as inactive)")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        productService.deleteProduct(user, id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Searches products by name or description")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String q,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        List<Product> products = productService.searchProducts(user, q);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "Get products by category", description = "Retrieves products filtered by category")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @PathVariable String category,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        List<Product> products = productService.getProductsByCategory(user, category);
        return ResponseEntity.ok(products);
    }
    
    @PostMapping("/sync/shopify")
    @Operation(summary = "Sync products from Shopify", description = "Syncs products from Shopify to local database")
    public ResponseEntity<String> syncFromShopify(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        productService.syncFromShopify(user);
        return ResponseEntity.ok("Product sync initiated successfully");
    }
}
