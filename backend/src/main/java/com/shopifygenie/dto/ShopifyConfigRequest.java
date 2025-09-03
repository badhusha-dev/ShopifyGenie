package com.shopifygenie.dto;

import jakarta.validation.constraints.NotBlank;

public class ShopifyConfigRequest {
    
    @NotBlank(message = "Shop domain is required")
    private String shopDomain;
    
    @NotBlank(message = "API key is required")
    private String apiKey;
    
    @NotBlank(message = "API secret is required")
    private String apiSecret;
    
    @NotBlank(message = "Access token is required")
    private String accessToken;
    
    private String scopes;
    
    // Constructors
    public ShopifyConfigRequest() {}
    
    public ShopifyConfigRequest(String shopDomain, String apiKey, String apiSecret, 
                               String accessToken, String scopes) {
        this.shopDomain = shopDomain;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.accessToken = accessToken;
        this.scopes = scopes;
    }
    
    // Getters and Setters
    public String getShopDomain() {
        return shopDomain;
    }
    
    public void setShopDomain(String shopDomain) {
        this.shopDomain = shopDomain;
    }
    
    public String getApiKey() {
        return apiKey;
    }
    
    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
    
    public String getApiSecret() {
        return apiSecret;
    }
    
    public void setApiSecret(String apiSecret) {
        this.apiSecret = apiSecret;
    }
    
    public String getAccessToken() {
        return accessToken;
    }
    
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    
    public String getScopes() {
        return scopes;
    }
    
    public void setScopes(String scopes) {
        this.scopes = scopes;
    }
}
