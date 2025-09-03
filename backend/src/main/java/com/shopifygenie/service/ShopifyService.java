package com.shopifygenie.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopifygenie.entity.ShopifyConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class ShopifyService {
    
    private static final Logger logger = LoggerFactory.getLogger(ShopifyService.class);
    
    @Value("${shopify.api-version}")
    private String apiVersion;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public ShopifyService() {
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = new ObjectMapper();
    }
    
    public Mono<Map<String, Object>> getProducts(ShopifyConfig config, int limit, String pageInfo) {
        String url = buildApiUrl(config.getShopDomain(), "/products.json");
        
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(url);
                    if (limit > 0) {
                        uriBuilder.queryParam("limit", limit);
                    }
                    if (pageInfo != null && !pageInfo.isEmpty()) {
                        uriBuilder.queryParam("page_info", pageInfo);
                    }
                    return uriBuilder.build();
                })
                .header("X-Shopify-Access-Token", config.getAccessToken())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnSuccess(result -> logger.info("Successfully fetched products from shop: {}", config.getShopDomain()))
                .doOnError(error -> logger.error("Error fetching products from shop: {}", config.getShopDomain(), error));
    }
    
    public Mono<Map<String, Object>> createProduct(ShopifyConfig config, Map<String, Object> productData) {
        String url = buildApiUrl(config.getShopDomain(), "/products.json");
        
        return webClient.post()
                .uri(url)
                .header("X-Shopify-Access-Token", config.getAccessToken())
                .bodyValue(Map.of("product", productData))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnSuccess(result -> logger.info("Successfully created product in shop: {}", config.getShopDomain()))
                .doOnError(error -> logger.error("Error creating product in shop: {}", config.getShopDomain(), error));
    }
    
    public Mono<Map<String, Object>> updateProduct(ShopifyConfig config, Long productId, Map<String, Object> productData) {
        String url = buildApiUrl(config.getShopDomain(), "/products/" + productId + ".json");
        
        return webClient.put()
                .uri(url)
                .header("X-Shopify-Access-Token", config.getAccessToken())
                .bodyValue(Map.of("product", productData))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnSuccess(result -> logger.info("Successfully updated product {} in shop: {}", productId, config.getShopDomain()))
                .doOnError(error -> logger.error("Error updating product {} in shop: {}", productId, config.getShopDomain(), error));
    }
    
    public Mono<Map<String, Object>> getOrders(ShopifyConfig config, int limit, String pageInfo) {
        String url = buildApiUrl(config.getShopDomain(), "/orders.json");
        
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(url);
                    if (limit > 0) {
                        uriBuilder.queryParam("limit", limit);
                    }
                    if (pageInfo != null && !pageInfo.isEmpty()) {
                        uriBuilder.queryParam("page_info", pageInfo);
                    }
                    return uriBuilder.build();
                })
                .header("X-Shopify-Access-Token", config.getAccessToken())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnSuccess(result -> logger.info("Successfully fetched orders from shop: {}", config.getShopDomain()))
                .doOnError(error -> logger.error("Error fetching orders from shop: {}", config.getShopDomain(), error));
    }
    
    public Mono<Map<String, Object>> createOrder(ShopifyConfig config, Map<String, Object> orderData) {
        String url = buildApiUrl(config.getShopDomain(), "/orders.json");
        
        return webClient.post()
                .uri(url)
                .header("X-Shopify-Access-Token", config.getAccessToken())
                .bodyValue(Map.of("order", orderData))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnSuccess(result -> logger.info("Successfully created order in shop: {}", config.getShopDomain()))
                .doOnError(error -> logger.error("Error creating order in shop: {}", config.getShopDomain(), error));
    }
    
    public Mono<Map<String, Object>> getCustomers(ShopifyConfig config, int limit, String pageInfo) {
        String url = buildApiUrl(config.getShopDomain(), "/customers.json");
        
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(url);
                    if (limit > 0) {
                        uriBuilder.queryParam("limit", limit);
                    }
                    if (pageInfo != null && !pageInfo.isEmpty()) {
                        uriBuilder.queryParam("page_info", pageInfo);
                    }
                    return uriBuilder.build();
                })
                .header("X-Shopify-Access-Token", config.getAccessToken())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnSuccess(result -> logger.info("Successfully fetched customers from shop: {}", config.getShopDomain()))
                .doOnError(error -> logger.error("Error fetching customers from shop: {}", config.getShopDomain(), error));
    }
    
    public Mono<Map<String, Object>> executeGraphQL(ShopifyConfig config, String query, Map<String, Object> variables) {
        String url = buildGraphQLUrl(config.getShopDomain());
        
        Map<String, Object> requestBody = Map.of(
                "query", query,
                "variables", variables != null ? variables : Map.of()
        );
        
        return webClient.post()
                .uri(url)
                .header("X-Shopify-Access-Token", config.getAccessToken())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnSuccess(result -> logger.info("Successfully executed GraphQL query in shop: {}", config.getShopDomain()))
                .doOnError(error -> logger.error("Error executing GraphQL query in shop: {}", config.getShopDomain(), error));
    }
    
    private String buildApiUrl(String shopDomain, String endpoint) {
        return "https://" + shopDomain + "/admin/api/" + apiVersion + endpoint;
    }
    
    private String buildGraphQLUrl(String shopDomain) {
        return "https://" + shopDomain + "/admin/api/" + apiVersion + "/graphql.json";
    }
}
