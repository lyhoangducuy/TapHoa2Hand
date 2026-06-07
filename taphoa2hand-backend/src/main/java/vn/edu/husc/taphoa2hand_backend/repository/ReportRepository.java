package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.Report;
import vn.edu.husc.taphoa2hand_backend.entity.ReportReasonEnum;
import vn.edu.husc.taphoa2hand_backend.entity.ReportStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.ReportTypeEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String>, JpaSpecificationExecutor<Report> {

    List<Report> findByReporter(Users reporter);

    List<Report> findByReportedUser(Users reportedUser);

    List<Report> findByStatus(ReportStatusEnum status);

    List<Report> findByReporterAndStatus(Users reporter, ReportStatusEnum status);

    List<Report> findByReportedUserAndStatus(Users reportedUser, ReportStatusEnum status);

    List<Report> findByOrderAndStatus(Order order, ReportStatusEnum pending);

    List<Report> findByReporterAndOrder(Users reporter, Order order);

    @Query("SELECT r FROM Report r LEFT JOIN FETCH r.reporter LEFT JOIN FETCH r.reportedUser LEFT JOIN FETCH r.reportedPost LEFT JOIN FETCH r.order LEFT JOIN FETCH r.reviewedBy WHERE r.reporter = :reporter")
    Page<Report> findByReporter(Users reporter, Pageable pageable);

    Page<Report> findByStatus(ReportStatusEnum status, Pageable pageable);

    @Query("SELECT r FROM Report r LEFT JOIN FETCH r.reporter LEFT JOIN FETCH r.reportedUser LEFT JOIN FETCH r.reportedPost LEFT JOIN FETCH r.order LEFT JOIN FETCH r.reviewedBy WHERE r.reporter = :reporter AND r.status = :status")
    Page<Report> findByReporterAndStatus(Users reporter, ReportStatusEnum status, Pageable pageable);

    long countByStatus(ReportStatusEnum status);

    List<Report> findByType(ReportTypeEnum type);

    Page<Report> findByType(ReportTypeEnum type, Pageable pageable);

    // Statistics queries
    Long countByCreatedAtBetween(LocalDateTime fromDate, LocalDateTime toDate);
    
    Page<Report> findByCreatedAtBetween(LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);

    // Reports by reason (for chart)
    @Query(value = """
        SELECT r.reason as reason, COUNT(*) as count
        FROM reports r
        WHERE (:fromDate IS NULL OR r.created_at >= :fromDate)
        AND (:toDate IS NULL OR r.created_at <= :toDate)
        GROUP BY r.reason
        ORDER BY count DESC
        """, nativeQuery = true)
    List<Object[]> getReportsCountByReason(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );

    // Top reported users
    @Query(value = """
        SELECT r.reported_user_id as oderId, COUNT(*) as totalReports
        FROM reports r
        WHERE r.reported_user_id IS NOT NULL
        AND (:fromDate IS NULL OR r.created_at >= :fromDate)
        AND (:toDate IS NULL OR r.created_at <= :toDate)
        GROUP BY r.reported_user_id
        ORDER BY totalReports DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> getTopReportedUsers(
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        @Param("limit") int limit
    );

    // Recent reports
    @Query(value = """
        SELECT r.id, r.created_at, r.type, r.reason, 'REPORT' as type
        FROM reports r
        ORDER BY r.created_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> getRecentReports(@Param("limit") int limit);
}
