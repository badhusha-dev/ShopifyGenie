package com.shopifygenie.repository;

import com.shopifygenie.entity.Customer;
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
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    List<Customer> findByUserAndIsActiveTrue(User user);
    
    Page<Customer> findByUserAndIsActiveTrue(User user, Pageable pageable);
    
    Optional<Customer> findByUserAndEmailAndIsActiveTrue(User user, String email);
    
    Optional<Customer> findByUserAndShopifyCustomerId(User user, String shopifyCustomerId);
    
    @Query("SELECT c FROM Customer c WHERE c.user = :user AND c.isActive = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Customer> findByUserAndSearchTerm(@Param("user") User user, @Param("searchTerm") String searchTerm);
    
    boolean existsByUserAndEmailAndIsActiveTrue(User user, String email);
}
