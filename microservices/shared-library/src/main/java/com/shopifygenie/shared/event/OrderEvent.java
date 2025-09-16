package com.shopifygenie.shared.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.shopifygenie.shared.dto.OrderDto;

import java.time.LocalDateTime;

public class OrderEvent {
    
    private String eventType;
    private OrderDto order;
    private Long userId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    // Constructors
    public OrderEvent() {
        this.timestamp = LocalDateTime.now();
    }
    
    public OrderEvent(String eventType, OrderDto order, Long userId) {
        this.eventType = eventType;
        this.order = order;
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
    
    public OrderDto getOrder() {
        return order;
    }
    
    public void setOrder(OrderDto order) {
        this.order = order;
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
