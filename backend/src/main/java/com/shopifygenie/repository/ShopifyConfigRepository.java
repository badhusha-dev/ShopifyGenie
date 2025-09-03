package com.shopifygenie.repository;

import com.shopifygenie.entity.ShopifyConfig;
import com.shopifygenie.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShopifyConfigRepository extends JpaRepository<ShopifyConfig, Long> {
    
    List<ShopifyConfig> findByUser(User user);
    
    List<ShopifyConfig> findByUserAndIsActiveTrue(User user);
    
    Optional<ShopifyConfig> findByUserAndShopDomain(User user, String shopDomain);
    
    Optional<ShopifyConfig> findByUserAndShopDomainAndIsActiveTrue(User user, String shopDomain);
    
    boolean existsByUserAndShopDomain(User user, String shopDomain);
}
