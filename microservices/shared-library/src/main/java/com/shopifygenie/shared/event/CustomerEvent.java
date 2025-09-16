package com.shopifygenie.shared.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.shopifygenie.shared.dto.CustomerDto;

import java.time.LocalDateTime;

public class CustomerEvent {
    
    private String eventType;
    private CustomerDto customer;
    private Long userId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    // Constructors
    public CustomerEvent() {
        this.timestamp = LocalDateTime.now();
    }
    
    public CustomerEvent(String eventType, CustomerDto customer, Long userId) {
        this.eventType = eventType;
        this.customer = customer;
        this.userId = userId;
        this.timestamp = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getEventType() {
        return eventType;
    }
    
    public void setEventType(String eventType) {
        this.eventType = eventType;
    }
    
    public CustomerDto getCustomer() {
        return customer;
    }
    
    public void setCustomer(CustomerDto customer) {
        this.customer = customer;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
