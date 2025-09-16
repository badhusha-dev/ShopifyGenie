package com.shopifygenie.customer.repository;

import com.shopifygenie.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    List<Customer> findByUserIdAndActiveTrue(Long userId);
    
    @Query("SELECT c FROM Customer c WHERE c.userId = :userId AND c.active = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Customer> searchCustomers(@Param("userId") Long userId, @Param("query") String query);
    
    boolean existsByEmailAndUserId(String email, Long userId);
}
