package com.shopifygenie.shared.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.shopifygenie.shared.dto.ProductDto;

import java.time.LocalDateTime;

public class ProductEvent {
    
    private String eventType;
    private ProductDto product;
    private Long userId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    // Constructors
    public ProductEvent() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ProductEvent(String eventType, ProductDto product, Long userId) {
        this.eventType = eventType;
        this.product = product;
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
    
    public ProductDto getProduct() {
        return product;
    }
    
    public void setProduct(ProductDto product) {
        this.product = product;
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
