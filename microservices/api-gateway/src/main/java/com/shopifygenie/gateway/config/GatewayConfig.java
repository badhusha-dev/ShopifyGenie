package com.shopifygenie.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service Routes
                .route("auth-service", r -> r.path("/api/auth/**")
                        .uri("lb://auth-service"))
                
                // Customer Service Routes
                .route("customer-service", r -> r.path("/api/customers/**")
                        .uri("lb://customer-service"))
                
                // Product Service Routes
                .route("product-service", r -> r.path("/api/products/**")
                        .uri("lb://product-service"))
                
                // Order Service Routes
                .route("order-service", r -> r.path("/api/orders/**")
                        .uri("lb://order-service"))
                
                // Notification Service Routes
                .route("notification-service", r -> r.path("/api/notifications/**")
                        .uri("lb://notification-service"))
                
                .build();
    }
}
