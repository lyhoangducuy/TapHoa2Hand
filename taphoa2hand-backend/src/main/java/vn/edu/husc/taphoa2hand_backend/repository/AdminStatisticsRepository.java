package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.OrderStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminStatisticsRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {

    // === REVENUE QUERIES ===
    
    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0) 
        FROM Order o 
        WHERE o.status = 'COMPLETED' 
        AND (:fromDate IS NULL OR o.updatedAt >= :fromDate)
        AND (:toDate IS NULL OR o.updatedAt <= :toDate)
    """)
    BigDecimal getTotalRevenue(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );

    @Query("""
        SELECT COUNT(o) 
        FROM Order o 
        WHERE o.status = 'COMPLETED'
        AND (:fromDate IS NULL OR o.updatedAt >= :fromDate)
        AND (:toDate IS NULL OR o.updatedAt <= :toDate)
    """)
    Long countCompletedOrders(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );

    @Query("""
        SELECT COUNT(o) 
        FROM Order o 
        WHERE o.paymentMethod = 'MIDDLEMAN' 
        AND o.status = 'COMPLETED'
        AND (:fromDate IS NULL OR o.updatedAt >= :fromDate)
        AND (:toDate IS NULL OR o.updatedAt <= :toDate)
    """)
    Long countEscrowOrders(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );

    @Query("""
        SELECT COUNT(o) 
        FROM Order o 
        WHERE o.paymentMethod = 'DIRECT' 
        AND o.status = 'COMPLETED'
        AND (:fromDate IS NULL OR o.updatedAt >= :fromDate)
        AND (:toDate IS NULL OR o.updatedAt <= :toDate)
    """)
    Long countDirectOrders(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );

    // === REVENUE CHART DATA ===
    
    @Query(value = """
        SELECT DATE(o.updated_at) as date, 
               COALESCE(SUM(o.total_amount), 0) as revenue,
               COUNT(*) as orderCount
        FROM orders o
        WHERE o.status = 'COMPLETED'
        AND (:fromDate IS NULL OR o.updated_at >= :fromDate)
        AND (:toDate IS NULL OR o.updated_at <= :toDate)
        GROUP BY DATE(o.updated_at)
        ORDER BY DATE(o.updated_at) ASC
        """, nativeQuery = true)
    List<Object[]> getRevenueChartData(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );

    // === ORDER COUNT CHART DATA ===
    
    @Query(value = """
        SELECT DATE(o.created_at) as date, COUNT(*) as orderCount
        FROM orders o
        WHERE (:fromDate IS NULL OR o.created_at >= :fromDate)
        AND (:toDate IS NULL OR o.created_at <= :toDate)
        GROUP BY DATE(o.created_at)
        ORDER BY DATE(o.created_at) ASC
        """, nativeQuery = true)
    List<Object[]> getOrderCountChartData(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );

    // === REFUND ORDERS ===
    
    @Query("""
        SELECT COUNT(o) 
        FROM Order o 
        WHERE o.status = 'RETURNED'
        AND (:fromDate IS NULL OR o.updatedAt >= :fromDate)
        AND (:toDate IS NULL OR o.updatedAt <= :toDate)
    """)
    Long countRefundOrders(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );

    // === PAGINATED ORDER LIST ===
    
    @Query("""
        SELECT o FROM Order o 
        LEFT JOIN FETCH o.buyer 
        LEFT JOIN FETCH o.seller
        WHERE (:fromDate IS NULL OR o.createdAt >= :fromDate)
        AND (:toDate IS NULL OR o.createdAt <= :toDate)
        ORDER BY o.createdAt DESC
    """)
    Page<Order> findOrdersWithDateRange(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable
    );
}
