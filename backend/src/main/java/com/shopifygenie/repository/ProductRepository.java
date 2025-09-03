package com.shopifygenie.repository;

import com.shopifygenie.entity.Product;
import com.shopifygenie.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByUserAndIsActiveTrue(User user);
    
    Page<Product> findByUserAndIsActiveTrue(User user, Pageable pageable);
    
    List<Product> findByUserAndCategoryAndIsActiveTrue(User user, String category);
    
    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Product> findByUserAndSearchTerm(@Param("user") User user, @Param("searchTerm") String searchTerm);
    
    Optional<Product> findByUserAndShopifyProductId(User user, String shopifyProductId);
    
    boolean existsByUserAndNameAndIsActiveTrue(User user, String name);
}
