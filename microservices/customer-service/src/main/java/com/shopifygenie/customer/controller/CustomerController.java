package com.shopifygenie.customer.controller;

import com.shopifygenie.customer.entity.Customer;
import com.shopifygenie.customer.service.CustomerService;
import com.shopifygenie.shared.dto.CustomerDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<Customer>> getUserCustomers(@RequestHeader("X-User-Id") Long userId) {
        List<Customer> customers = customerService.getUserCustomers(userId);
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID", description = "Retrieves a specific customer by ID")
    public ResponseEntity<Customer> getCustomer(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        Customer customer = customerService.getCustomerById(userId, id);
        return ResponseEntity.ok(customer);
    }
    
    @PostMapping
    @Operation(summary = "Create customer", description = "Creates a new customer")
    public ResponseEntity<Customer> createCustomer(
            @Valid @RequestBody CustomerDto request,
            @RequestHeader("X-User-Id") Long userId) {
        
        Customer customer = customerService.createCustomer(userId, request);
        return ResponseEntity.ok(customer);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update customer", description = "Updates an existing customer")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDto request,
            @RequestHeader("X-User-Id") Long userId) {
        
        Customer customer = customerService.updateCustomer(userId, id, request);
        return ResponseEntity.ok(customer);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer", description = "Deletes a customer (marks as inactive)")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        customerService.deleteCustomer(userId, id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search customers", description = "Searches customers by name or email")
    public ResponseEntity<List<Customer>> searchCustomers(
            @RequestParam String q,
            @RequestHeader("X-User-Id") Long userId) {
        
        List<Customer> customers = customerService.searchCustomers(userId, q);
        return ResponseEntity.ok(customers);
    }
    
    @PostMapping("/{id}/loyalty/add")
    @Operation(summary = "Add loyalty points", description = "Adds loyalty points to a customer")
    public ResponseEntity<Customer> addLoyaltyPoints(
            @PathVariable Long id,
            @RequestParam Integer points,
            @RequestHeader("X-User-Id") Long userId) {
        
        Customer customer = customerService.addLoyaltyPoints(userId, id, points);
        return ResponseEntity.ok(customer);
    }
    
    @PostMapping("/{id}/loyalty/use")
    @Operation(summary = "Use loyalty points", description = "Uses loyalty points from a customer")
    public ResponseEntity<Customer> useLoyaltyPoints(
            @PathVariable Long id,
            @RequestParam Integer points,
            @RequestHeader("X-User-Id") Long userId) {
        
        Customer customer = customerService.useLoyaltyPoints(userId, id, points);
        return ResponseEntity.ok(customer);
    }
}
