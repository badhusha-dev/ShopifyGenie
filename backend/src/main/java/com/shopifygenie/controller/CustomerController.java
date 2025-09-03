package com.shopifygenie.controller;

import com.shopifygenie.dto.CustomerRequest;
import com.shopifygenie.entity.Customer;
import com.shopifygenie.entity.User;
import com.shopifygenie.service.CustomerService;
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
@RequestMapping("/customers")
@Tag(name = "Customers", description = "Customer management APIs")
@SecurityRequirement(name = "bearerAuth")
public class CustomerController {
    
    @Autowired
    private CustomerService customerService;
    
    @GetMapping
    @Operation(summary = "Get user's customers", description = "Retrieves all customers for the authenticated user")
    public ResponseEntity<List<Customer>> getUserCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        if (page == 0 && size == 20) {
            // Return all customers without pagination
            List<Customer> customers = customerService.getUserCustomers(user);
            return ResponseEntity.ok(customers);
        } else {
            // Return paginated customers
            Pageable pageable = PageRequest.of(page, size);
            Page<Customer> customerPage = customerService.getUserCustomers(user, pageable);
            return ResponseEntity.ok(customerPage.getContent());
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID", description = "Retrieves a specific customer by ID")
    public ResponseEntity<Customer> getCustomer(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Customer customer = customerService.getCustomerById(user, id);
        return ResponseEntity.ok(customer);
    }
    
    @PostMapping
    @Operation(summary = "Create customer", description = "Creates a new customer")
    public ResponseEntity<Customer> createCustomer(
            @Valid @RequestBody CustomerRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Customer customer = customerService.createCustomer(user, request);
        return ResponseEntity.ok(customer);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update customer", description = "Updates an existing customer")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Customer customer = customerService.updateCustomer(user, id, request);
        return ResponseEntity.ok(customer);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer", description = "Deletes a customer (marks as inactive)")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        customerService.deleteCustomer(user, id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search customers", description = "Searches customers by name or email")
    public ResponseEntity<List<Customer>> searchCustomers(
            @RequestParam String q,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        List<Customer> customers = customerService.searchCustomers(user, q);
        return ResponseEntity.ok(customers);
    }
    
    @PostMapping("/{id}/loyalty/add")
    @Operation(summary = "Add loyalty points", description = "Adds loyalty points to a customer")
    public ResponseEntity<Customer> addLoyaltyPoints(
            @PathVariable Long id,
            @RequestParam Integer points,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Customer customer = customerService.addLoyaltyPoints(user, id, points);
        return ResponseEntity.ok(customer);
    }
    
    @PostMapping("/{id}/loyalty/use")
    @Operation(summary = "Use loyalty points", description = "Uses loyalty points from a customer")
    public ResponseEntity<Customer> useLoyaltyPoints(
            @PathVariable Long id,
            @RequestParam Integer points,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        Customer customer = customerService.useLoyaltyPoints(user, id, points);
        return ResponseEntity.ok(customer);
    }
    
    @PostMapping("/sync/shopify")
    @Operation(summary = "Sync customers from Shopify", description = "Syncs customers from Shopify to local database")
    public ResponseEntity<String> syncFromShopify(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        customerService.syncFromShopify(user);
        return ResponseEntity.ok("Customer sync initiated successfully");
    }
}
