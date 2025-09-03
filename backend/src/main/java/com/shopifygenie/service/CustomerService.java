package com.shopifygenie.service;

import com.shopifygenie.dto.CustomerRequest;
import com.shopifygenie.entity.Customer;
import com.shopifygenie.entity.ShopifyConfig;
import com.shopifygenie.entity.User;
import com.shopifygenie.repository.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class CustomerService {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private ShopifyConfigService shopifyConfigService;
    
    @Autowired
    private ShopifyService shopifyService;
    
    public List<Customer> getUserCustomers(User user) {
        return customerRepository.findByUserAndIsActiveTrue(user);
    }
    
    public Page<Customer> getUserCustomers(User user, Pageable pageable) {
        return customerRepository.findByUserAndIsActiveTrue(user, pageable);
    }
    
    public Customer getCustomerById(User user, Long customerId) {
        return customerRepository.findById(customerId)
                .filter(customer -> customer.getUser().getId().equals(user.getId()) && customer.isActive())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
    }
    
    public Customer createCustomer(User user, CustomerRequest request) {
        // Check if customer email already exists for this user
        if (customerRepository.existsByUserAndEmailAndIsActiveTrue(user, request.getEmail())) {
            throw new RuntimeException("Customer with email '" + request.getEmail() + "' already exists");
        }
        
        Customer customer = new Customer();
        customer.setUser(user);
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setLoyaltyPoints(0);
        customer.setActive(true);
        
        Customer savedCustomer = customerRepository.save(customer);
        
        // If user has Shopify config, sync to Shopify
        try {
            Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
            if (shopifyConfig.isPresent()) {
                syncCustomerToShopify(savedCustomer, shopifyConfig.get());
            }
        } catch (Exception e) {
            logger.error("Failed to sync customer to Shopify", e);
            // Don't fail the operation if Shopify sync fails
        }
        
        return savedCustomer;
    }
    
    public Customer updateCustomer(User user, Long customerId, CustomerRequest request) {
        Customer customer = getCustomerById(user, customerId);
        
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        
        Customer updatedCustomer = customerRepository.save(customer);
        
        // If user has Shopify config, sync to Shopify
        try {
            Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
            if (shopifyConfig.isPresent() && customer.getShopifyCustomerId() != null) {
                syncCustomerUpdateToShopify(updatedCustomer, shopifyConfig.get());
            }
        } catch (Exception e) {
            logger.error("Failed to sync customer update to Shopify", e);
        }
        
        return updatedCustomer;
    }
    
    public void deleteCustomer(User user, Long customerId) {
        Customer customer = getCustomerById(user, customerId);
        customer.setActive(false);
        customerRepository.save(customer);
        
        // Note: Shopify doesn't support customer deletion via API
        logger.info("Customer marked as inactive. Shopify customer deletion not supported via API.");
    }
    
    public List<Customer> searchCustomers(User user, String searchTerm) {
        return customerRepository.findByUserAndSearchTerm(user, searchTerm);
    }
    
    public Customer addLoyaltyPoints(User user, Long customerId, Integer points) {
        Customer customer = getCustomerById(user, customerId);
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        return customerRepository.save(customer);
    }
    
    public Customer useLoyaltyPoints(User user, Long customerId, Integer points) {
        Customer customer = getCustomerById(user, customerId);
        if (customer.getLoyaltyPoints() < points) {
            throw new RuntimeException("Insufficient loyalty points");
        }
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() - points);
        return customerRepository.save(customer);
    }
    
    private void syncCustomerToShopify(Customer customer, ShopifyConfig config) {
        try {
            Map<String, Object> customerData = Map.of(
                    "customer", Map.of(
                            "first_name", customer.getName().split(" ")[0],
                            "last_name", customer.getName().split(" ").length > 1 ? customer.getName().substring(customer.getName().indexOf(" ") + 1) : "",
                            "email", customer.getEmail(),
                            "phone", customer.getPhone() != null ? customer.getPhone() : "",
                                                                "addresses", List.of(Map.of(
                                            "address1", customer.getAddress() != null ? customer.getAddress() : "",
                                            "city", "",
                                            "province", "",
                                            "country", "",
                                            "zip", ""
                                    ))
                    )
            );
            
            // Note: This would require a customer creation endpoint in ShopifyService
            // For now, we'll just log that we would sync to Shopify
            logger.info("Would sync customer to Shopify: {}", customer.getEmail());
        } catch (Exception e) {
            logger.error("Error syncing customer to Shopify", e);
        }
    }
    
    private void syncCustomerUpdateToShopify(Customer customer, ShopifyConfig config) {
        try {
            // Note: This would require a customer update endpoint in ShopifyService
            logger.info("Would update customer in Shopify: {}", customer.getEmail());
        } catch (Exception e) {
            logger.error("Error updating customer in Shopify", e);
        }
    }
    
    public void syncFromShopify(User user) {
        Optional<ShopifyConfig> shopifyConfig = shopifyConfigService.getUserShopifyConfig(user);
        if (shopifyConfig.isEmpty()) {
            throw new RuntimeException("No Shopify configuration found for user");
        }
        
        shopifyService.getCustomers(shopifyConfig.get(), 250, null)
                .subscribe(
                        response -> {
                            if (response.containsKey("customers")) {
                                List<Map<String, Object>> shopifyCustomers = (List<Map<String, Object>>) response.get("customers");
                                for (Map<String, Object> shopifyCustomer : shopifyCustomers) {
                                    syncShopifyCustomerToLocal(user, shopifyCustomer);
                                }
                            }
                        },
                        error -> logger.error("Failed to sync customers from Shopify", error)
                );
    }
    
    private void syncShopifyCustomerToLocal(User user, Map<String, Object> shopifyCustomer) {
        try {
            String shopifyCustomerId = shopifyCustomer.get("id").toString();
            String firstName = (String) shopifyCustomer.get("first_name");
            String lastName = (String) shopifyCustomer.get("last_name");
            String email = (String) shopifyCustomer.get("email");
            String phone = (String) shopifyCustomer.get("phone");
            
            String fullName = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "").trim();
            
            // Check if customer already exists
            Optional<Customer> existingCustomer = customerRepository.findByUserAndShopifyCustomerId(user, shopifyCustomerId);
            
            if (existingCustomer.isPresent()) {
                // Update existing customer
                Customer customer = existingCustomer.get();
                customer.setName(fullName);
                customer.setEmail(email);
                customer.setPhone(phone);
                customerRepository.save(customer);
            } else {
                // Create new customer
                Customer customer = new Customer();
                customer.setUser(user);
                customer.setName(fullName);
                customer.setEmail(email);
                customer.setPhone(phone);
                customer.setShopifyCustomerId(shopifyCustomerId);
                customer.setLoyaltyPoints(0);
                customer.setActive(true);
                customerRepository.save(customer);
            }
        } catch (Exception e) {
            logger.error("Error syncing Shopify customer to local", e);
        }
    }
}
