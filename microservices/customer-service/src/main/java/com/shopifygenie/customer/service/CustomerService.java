package com.shopifygenie.customer.service;

import com.shopifygenie.customer.entity.Customer;
import com.shopifygenie.customer.repository.CustomerRepository;
import com.shopifygenie.shared.dto.CustomerDto;
import com.shopifygenie.shared.event.CustomerEvent;
import com.shopifygenie.shared.event.NotificationEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private KafkaTemplate<String, CustomerEvent> customerEventTemplate;
    
    @Autowired
    private KafkaTemplate<String, NotificationEvent> notificationEventTemplate;
    
    public List<Customer> getUserCustomers(Long userId) {
        return customerRepository.findByUserIdAndActiveTrue(userId);
    }
    
    public Customer getCustomerById(Long userId, Long customerId) {
        return customerRepository.findById(customerId)
                .filter(customer -> customer.getUserId().equals(userId) && customer.isActive())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }
    
    public Customer createCustomer(Long userId, CustomerDto customerDto) {
        if (customerRepository.existsByEmailAndUserId(customerDto.getEmail(), userId)) {
            throw new RuntimeException("Customer with this email already exists");
        }
        
        Customer customer = new Customer();
        customer.setName(customerDto.getName());
        customer.setEmail(customerDto.getEmail());
        customer.setPhone(customerDto.getPhone());
        customer.setAddress(customerDto.getAddress());
        customer.setCity(customerDto.getCity());
        customer.setState(customerDto.getState());
        customer.setZipCode(customerDto.getZipCode());
        customer.setCountry(customerDto.getCountry());
        customer.setLoyaltyPoints(customerDto.getLoyaltyPoints());
        customer.setUserId(userId);
        
        Customer savedCustomer = customerRepository.save(customer);
        
        // Send customer created event
        CustomerEvent customerEvent = new CustomerEvent("CUSTOMER_CREATED", 
                convertToDto(savedCustomer), userId);
        customerEventTemplate.send("customer-events", customerEvent);
        
        return savedCustomer;
    }
    
    public Customer updateCustomer(Long userId, Long customerId, CustomerDto customerDto) {
        Customer customer = getCustomerById(userId, customerId);
        
        customer.setName(customerDto.getName());
        customer.setEmail(customerDto.getEmail());
        customer.setPhone(customerDto.getPhone());
        customer.setAddress(customerDto.getAddress());
        customer.setCity(customerDto.getCity());
        customer.setState(customerDto.getState());
        customer.setZipCode(customerDto.getZipCode());
        customer.setCountry(customerDto.getCountry());
        
        Customer savedCustomer = customerRepository.save(customer);
        
        // Send customer updated event
        CustomerEvent customerEvent = new CustomerEvent("CUSTOMER_UPDATED", 
                convertToDto(savedCustomer), userId);
        customerEventTemplate.send("customer-events", customerEvent);
        
        return savedCustomer;
    }
    
    public void deleteCustomer(Long userId, Long customerId) {
        Customer customer = getCustomerById(userId, customerId);
        customer.setActive(false);
        customerRepository.save(customer);
        
        // Send customer deleted event
        CustomerEvent customerEvent = new CustomerEvent("CUSTOMER_DELETED", 
                convertToDto(customer), userId);
        customerEventTemplate.send("customer-events", customerEvent);
    }
    
    public List<Customer> searchCustomers(Long userId, String query) {
        return customerRepository.searchCustomers(userId, query);
    }
    
    public Customer addLoyaltyPoints(Long userId, Long customerId, Integer points) {
        Customer customer = getCustomerById(userId, customerId);
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        
        Customer savedCustomer = customerRepository.save(customer);
        
        // Send loyalty points notification
        NotificationEvent notificationEvent = new NotificationEvent(
            "LOYALTY_POINTS_ADDED",
            String.format("You have earned %d loyalty points! Total points: %d", 
                         points, savedCustomer.getLoyaltyPoints()),
            savedCustomer.getEmail(),
            "EMAIL",
            userId
        );
        notificationEventTemplate.send("notification-events", notificationEvent);
        
        return savedCustomer;
    }
    
    public Customer useLoyaltyPoints(Long userId, Long customerId, Integer points) {
        Customer customer = getCustomerById(userId, customerId);
        
        if (customer.getLoyaltyPoints() < points) {
            throw new RuntimeException("Insufficient loyalty points");
        }
        
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() - points);
        
        Customer savedCustomer = customerRepository.save(customer);
        
        // Send loyalty points used notification
        NotificationEvent notificationEvent = new NotificationEvent(
            "LOYALTY_POINTS_USED",
            String.format("You have used %d loyalty points. Remaining points: %d", 
                         points, savedCustomer.getLoyaltyPoints()),
            savedCustomer.getEmail(),
            "EMAIL",
            userId
        );
        notificationEventTemplate.send("notification-events", notificationEvent);
        
        return savedCustomer;
    }
    
    private CustomerDto convertToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setAddress(customer.getAddress());
        dto.setCity(customer.getCity());
        dto.setState(customer.getState());
        dto.setZipCode(customer.getZipCode());
        dto.setCountry(customer.getCountry());
        dto.setLoyaltyPoints(customer.getLoyaltyPoints());
        dto.setUserId(customer.getUserId());
        dto.setActive(customer.isActive());
        return dto;
    }
}
