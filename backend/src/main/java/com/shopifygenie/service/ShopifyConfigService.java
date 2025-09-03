package com.shopifygenie.service;

import com.shopifygenie.dto.ShopifyConfigRequest;
import com.shopifygenie.entity.ShopifyConfig;
import com.shopifygenie.entity.User;
import com.shopifygenie.repository.ShopifyConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ShopifyConfigService {
    
    @Autowired
    private ShopifyConfigRepository shopifyConfigRepository;
    
    public ShopifyConfig saveConfig(User user, ShopifyConfigRequest request) {
        // Check if config already exists for this user and shop domain
        if (shopifyConfigRepository.existsByUserAndShopDomain(user, request.getShopDomain())) {
            throw new RuntimeException("Configuration already exists for shop domain: " + request.getShopDomain());
        }
        
        ShopifyConfig config = new ShopifyConfig();
        config.setUser(user);
        config.setShopDomain(request.getShopDomain());
        config.setApiKey(request.getApiKey());
        config.setApiSecret(request.getApiSecret());
        config.setAccessToken(request.getAccessToken());
        config.setScopes(request.getScopes());
        config.setActive(true);
        
        return shopifyConfigRepository.save(config);
    }
    
    public List<ShopifyConfig> getUserConfigs(User user) {
        return shopifyConfigRepository.findByUserAndIsActiveTrue(user);
    }
    
    public ShopifyConfig getConfigByIdAndUser(Long id, User user) {
        return shopifyConfigRepository.findById(id)
                .filter(config -> config.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Shopify configuration not found with id: " + id));
    }
    
    public ShopifyConfig updateConfig(Long id, User user, ShopifyConfigRequest request) {
        ShopifyConfig config = getConfigByIdAndUser(id, user);
        
        config.setShopDomain(request.getShopDomain());
        config.setApiKey(request.getApiKey());
        config.setApiSecret(request.getApiSecret());
        config.setAccessToken(request.getAccessToken());
        config.setScopes(request.getScopes());
        
        return shopifyConfigRepository.save(config);
    }
    
    public void deleteConfig(Long id, User user) {
        ShopifyConfig config = getConfigByIdAndUser(id, user);
        config.setActive(false);
        shopifyConfigRepository.save(config);
    }
    
    public ShopifyConfig getConfigByShopDomain(User user, String shopDomain) {
        return shopifyConfigRepository.findByUserAndShopDomainAndIsActiveTrue(user, shopDomain)
                .orElseThrow(() -> new RuntimeException("Shopify configuration not found for shop domain: " + shopDomain));
    }
    
    public Optional<ShopifyConfig> getUserShopifyConfig(User user) {
        List<ShopifyConfig> configs = shopifyConfigRepository.findByUserAndIsActiveTrue(user);
        return configs.isEmpty() ? Optional.empty() : Optional.of(configs.get(0));
    }
}
