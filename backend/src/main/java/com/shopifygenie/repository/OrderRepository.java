package com.shopifygenie.repository;

import com.shopifygenie.entity.Order;
import com.shopifygenie.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, Order.OrderStatus status);
    
    List<Order> findByUserAndCustomerIdOrderByCreatedAtDesc(User user, Long customerId);
    
    @Query("SELECT o FROM Order o WHERE o.user = :user AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByUserAndDateRange(@Param("user") User user, 
                                      @Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);
    
    Optional<Order> findByUserAndShopifyOrderId(User user, String shopifyOrderId);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user = :user AND o.status = :status")
    Long countByUserAndStatus(@Param("user") User user, @Param("status") Order.OrderStatus status);
    
    @Query("SELECT SUM(o.total) FROM Order o WHERE o.user = :user AND o.status = :status")
    Double sumTotalByUserAndStatus(@Param("user") User user, @Param("status") Order.OrderStatus status);
}
