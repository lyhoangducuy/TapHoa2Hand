package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.edu.husc.taphoa2hand_backend.dto.response.Statistics.*;
import vn.edu.husc.taphoa2hand_backend.entity.*;
import vn.edu.husc.taphoa2hand_backend.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Slf4j
public class AdminStatisticsService {

    private final AdminStatisticsRepository adminStatisticsRepository;
    private final OrderRepository orderRepository;
    private final UsersRepository usersRepository;
    private final PostsRepository postsRepository;
    private final ReportRepository reportRepository;
    private final FeedbackStatisticsRepository feedbackStatisticsRepository;
    private final PostAiAssessmentRepository postAiAssessmentRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DISPLAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // ============== DASHBOARD OVERVIEW ==============
@Transactional(readOnly = true)
    public DashboardOverviewResponse getDashboardOverview() {
        // Total counts
        Long totalUsers = usersRepository.count();
        Long totalPosts = postsRepository.count();
        Long totalOrders = orderRepository.count();
        Long totalReports = reportRepository.count();
        Long pendingReports = reportRepository.countByStatus(ReportStatusEnum.PENDING);

        // Active posts (not SOLD, HIDDEN, DELETED)
        Long activePosts = Long.parseLong(String.valueOf(postsRepository.findByStatusNotIn(List.of(PostStatusEnum.SOLD, PostStatusEnum.HIDDEN)).size()));

        // This month stats
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        
        Long newUsersThisMonth = usersRepository.countByCreatedAtBetween(startOfMonth, now);
        Long newPostsThisMonth = postsRepository.countByCreatedAtBetween(startOfMonth, now);
        Long newOrdersThisMonth = orderRepository.countByCreatedAtBetween(startOfMonth, now);
        
        // Revenue this month
        BigDecimal revenueThisMonth = adminStatisticsRepository.getTotalRevenue(startOfMonth, now);
        if (revenueThisMonth == null) revenueThisMonth = BigDecimal.ZERO;

        return DashboardOverviewResponse.builder()
                .totalUsers(totalUsers != null ? totalUsers : 0L)
                .totalPosts(totalPosts != null ? totalPosts : 0L)
                .activePosts(activePosts != null ? activePosts : 0L)
                .totalOrders(totalOrders != null ? totalOrders : 0L)
                .totalReports(totalReports != null ? totalReports : 0L)
                .pendingReports(pendingReports)
                .newUsersThisMonth(newUsersThisMonth != null ? newUsersThisMonth : 0L)
                .newPostsThisMonth(newPostsThisMonth != null ? newPostsThisMonth : 0L)
                .newOrdersThisMonth(newOrdersThisMonth != null ? newOrdersThisMonth : 0L)
                .revenueThisMonth(revenueThisMonth)
                .build();
    }

    // ============== SUMMARY ==============
@Transactional(readOnly = true)
    public StatisticsSummaryResponse getSummary(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        BigDecimal totalRevenue = adminStatisticsRepository.getTotalRevenue(fromDateTime, toDateTime);
        Long totalOrders = adminStatisticsRepository.countCompletedOrders(fromDateTime, toDateTime);
        Long escrowOrders = adminStatisticsRepository.countEscrowOrders(fromDateTime, toDateTime);
        Long directOrders = adminStatisticsRepository.countDirectOrders(fromDateTime, toDateTime);
        Long newUsers = usersRepository.countByCreatedAtBetween(fromDateTime, toDateTime);
        Long newPosts = postsRepository.countByCreatedAtBetween(fromDateTime, toDateTime);
        Long totalReports = reportRepository.countByCreatedAtBetween(fromDateTime, toDateTime);
        Long pendingReports = reportRepository.countPendingByCreatedAtBetween(fromDateTime, toDateTime);
        Long refundOrders = adminStatisticsRepository.countRefundOrders(fromDateTime, toDateTime);

        return StatisticsSummaryResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalOrders(totalOrders != null ? totalOrders : 0L)
                .escrowOrders(escrowOrders != null ? escrowOrders : 0L)
                .directOrders(directOrders != null ? directOrders : 0L)
                .newUsers(newUsers != null ? newUsers : 0L)
                .newPosts(newPosts != null ? newPosts : 0L)
                .totalReports(totalReports != null ? totalReports : 0L)
                .pendingReports(pendingReports != null ? pendingReports : 0L)
                .refundOrders(refundOrders != null ? refundOrders : 0L)
                .build();
    }

    // ============== REVENUE CHART ==============
@Transactional(readOnly = true)
    public List<RevenueChartItem> getRevenueChart(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        List<Object[]> data = adminStatisticsRepository.getRevenueChartData(fromDateTime, toDateTime);
        
        return data.stream().map(row -> {
            String date = row[0] != null ? row[0].toString() : "";
            BigDecimal revenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            Long orderCount = row[2] != null ? Long.parseLong(row[2].toString()) : 0L;
            return RevenueChartItem.builder()
                    .date(date)
                    .revenue(revenue)
                    .orderCount(orderCount)
                    .build();
        }).collect(Collectors.toList());
    }

    // ============== REVENUE BY MONTH ==============
@Transactional(readOnly = true)
    public List<RevenueChartItem> getRevenueByMonth(int year) {
        List<RevenueChartItem> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
            LocalDateTime end = start.plusMonths(1).minusSeconds(1);
            
            BigDecimal revenue = adminStatisticsRepository.getTotalRevenue(start, end);
            Long orderCount = adminStatisticsRepository.countCompletedOrders(start, end);
            
            result.add(RevenueChartItem.builder()
                    .date(year + "-" + String.format("%02d", month))
                    .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                    .orderCount(orderCount != null ? orderCount : 0L)
                    .build());
        }
        return result;
    }

    // ============== ORDER STATUS DISTRIBUTION ==============
@Transactional(readOnly = true)
    public List<OrderStatusCount> getOrderStatusDistribution() {
        List<Object[]> data = adminStatisticsRepository.getOrderStatusDistribution(null, null);
        long total = data.stream().mapToLong(row -> Long.parseLong(row[1].toString())).sum();
        
        return data.stream().map(row -> {
            String status = row[0].toString();
            Long count = Long.parseLong(row[1].toString());
            Double percentage = total > 0 ? (count * 100.0 / total) : 0.0;
            
            OrderStatusEnum statusEnum = null;
            try {
                statusEnum = OrderStatusEnum.valueOf(status);
            } catch (Exception e) {}
            
            return OrderStatusCount.builder()
                    .status(status)
                    .statusDisplayName(statusEnum != null ? statusEnum.getDisplayName() : status)
                    .count(count)
                    .percentage(Math.round(percentage * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());
    }

    // ============== POSTS BY CATEGORY ==============
@Transactional(readOnly = true)
    public List<CategoryPostCount> getPostsByCategory() {
        List<Object[]> data = postsRepository.getPostsCountByCategory(null, null);
        
        return data.stream().map(row -> {
            String categoryId = row[0] != null ? row[0].toString() : "";
            String categoryName = row[1] != null ? row[1].toString() : "Khác";
            Long count = Long.parseLong(row[2].toString());
            
            return CategoryPostCount.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .count(count)
                    .build();
        }).collect(Collectors.toList());
    }

    // ============== REPORT REASONS DISTRIBUTION ==============
@Transactional(readOnly = true)
    public List<ReportReasonCount> getReportReasonsDistribution() {
        List<Object[]> data = reportRepository.getReportsCountByReason(null, null);
        
        return data.stream().map(row -> {
            String reason = row[0].toString();
            Long count = Long.parseLong(row[1].toString());
            
            ReportReasonEnum reasonEnum = null;
            try {
                reasonEnum = ReportReasonEnum.valueOf(reason);
            } catch (Exception e) {}
            
            return ReportReasonCount.builder()
                    .reason(reason)
                    .reasonDisplayName(reasonEnum != null ? reasonEnum.getDisplayName() : reason)
                    .count(count)
                    .build();
        }).collect(Collectors.toList());
    }

    // ============== TOP SELLERS ==============
@Transactional(readOnly = true)
    public List<TopSellerResponse> getTopSellers(int limit) {
        List<Object[]> data = adminStatisticsRepository.getTopSellers(null, null, limit);
        
        return data.stream().map(row -> {
            String sellerId = row[0] != null ? row[0].toString() : "";
            Long totalOrders = Long.parseLong(row[1].toString());
            Long completedOrders = Long.parseLong(row[2].toString());
            
            Users seller = usersRepository.findById(sellerId).orElse(null);
            
            return TopSellerResponse.builder()
                    .userId(sellerId)
                    .fullName(seller != null ? seller.getFullName() : "N/A")
                    .avatar(seller != null ? seller.getAvatar() : null)
                    .totalOrders(totalOrders)
                    .completedOrders(completedOrders)
                    .build();
        }).collect(Collectors.toList());
    }

    // ============== TOP REPORTED USERS ==============
@Transactional(readOnly = true)
    public List<TopReportedUserResponse> getTopReportedUsers(int limit) {
        List<Object[]> data = reportRepository.getTopReportedUsers(null, null, limit);
        
        return data.stream().map(row -> {
            String oderId = row[0] != null ? row[0].toString() : "";
            Long totalReports = Long.parseLong(row[1].toString());
            
            Users user = usersRepository.findById(oderId).orElse(null);
            
            return TopReportedUserResponse.builder()
                    .userId(oderId)
                    .fullName(user != null ? user.getFullName() : "N/A")
                    .avatar(user != null ? user.getAvatar() : null)
                    .totalReports(totalReports)
                    .build();
        }).collect(Collectors.toList());
    }

    // ============== RATING DISTRIBUTION ==============
@Transactional(readOnly = true)
    public List<RatingDistribution> getRatingDistribution() {
        List<Object[]> data = feedbackStatisticsRepository.getRatingDistribution();
        long total = data.stream().mapToLong(row -> Long.parseLong(row[1].toString())).sum();
        
        // Ensure all 5 stars are present
        Map<Integer, Long> ratingCounts = data.stream()
                .collect(Collectors.toMap(
                        row -> Integer.parseInt(row[0].toString()),
                        row -> Long.parseLong(row[1].toString())
                ));
        
        List<RatingDistribution> result = new ArrayList<>();
        for (int i = 5; i >= 1; i--) {
            long count = ratingCounts.getOrDefault(i, 0L);
            double percentage = total > 0 ? (count * 100.0 / total) : 0.0;
            result.add(RatingDistribution.builder()
                    .rating(i)
                    .count(count)
                    .percentage(Math.round(percentage * 100.0) / 100.0)
                    .build());
        }
        return result;
    }

    // ============== AI ASSESSMENT DISTRIBUTION ==============
@Transactional(readOnly = true)
    public List<AiAssessmentCount> getAiAssessmentDistribution() {
        List<Object[]> data = postAiAssessmentRepository.getAssessmentDistribution();
        long total = data.stream().mapToLong(row -> Long.parseLong(row[1].toString())).sum();
        
        return data.stream().map(row -> {
            String assessment = row[0].toString();
            Long count = Long.parseLong(row[1].toString());
            Double percentage = total > 0 ? (count * 100.0 / total) : 0.0;
            
            String displayName = "SUSPICIOUS".equals(assessment) ? "Nghi ngờ gian lận" : "Bình thường";
            
            return AiAssessmentCount.builder()
                    .assessment(assessment)
                    .displayName(displayName)
                    .count(count)
                    .percentage(Math.round(percentage * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());
    }

    // ============== RECENT ACTIVITIES ==============
@Transactional(readOnly = true)
    public List<RecentActivity> getRecentActivities(int limit) {
        List<RecentActivity> activities = new ArrayList<>();
        
        // Recent orders
        List<Object[]> recentOrders = adminStatisticsRepository.getRecentOrders(limit / 3);
        for (Object[] row : recentOrders) {
            String oderId = row[0] != null ? row[0].toString() : "";
            String time = row[1] != null ? row[1].toString() : "";
            String status = row[2] != null ? row[2].toString() : "";
            
            activities.add(RecentActivity.builder()
                    .type("ORDER")
                    .description("Đơn hàng mới: " + status)
                    .targetId(oderId)
                    .icon("shopping-cart")
                    .time(time)
                    .build());
        }
        
        // Recent posts
        List<Object[]> recentPosts = postsRepository.getRecentPosts(limit / 3);
        for (Object[] row : recentPosts) {
            String postId = row[0] != null ? row[0].toString() : "";
            String title = row[1] != null ? row[1].toString() : "";
            String time = row[2] != null ? row[2].toString() : "";
            
            if (title.length() > 40) title = title.substring(0, 40) + "...";
            
            activities.add(RecentActivity.builder()
                    .type("POST")
                    .description("Bài đăng mới: " + title)
                    .targetId(postId)
                    .icon("box")
                    .time(time)
                    .build());
        }
        
        // Recent reports
        List<Object[]> recentReports = reportRepository.getRecentReports(limit / 3);
        for (Object[] row : recentReports) {
            String reportId = row[0] != null ? row[0].toString() : "";
            String time = row[1] != null ? row[1].toString() : "";
            
            activities.add(RecentActivity.builder()
                    .type("REPORT")
                    .description("Báo cáo mới #" + reportId.substring(0, Math.min(8, reportId.length())))
                    .targetId(reportId)
                    .icon("flag")
                    .time(time)
                    .build());
        }
        
        // Sort by time descending and limit
        return activities.stream()
                .sorted((a, b) -> {
                    if (a.getTime() == null) return 1;
                    if (b.getTime() == null) return -1;
                    return b.getTime().compareTo(a.getTime());
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    // ============== ORDERS STATISTICS ==============
@Transactional(readOnly = true)
    public Page<OrderStatisticsResponse> getOrdersStatistics(LocalDate fromDate, LocalDate toDate, int page, int size) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<Order> ordersPage = adminStatisticsRepository.findOrdersWithDateRange(fromDateTime, toDateTime, pageable);

        return ordersPage.map(this::mapToOrderStatistics);
    }
@Transactional(readOnly = true)
    public List<OrderStatisticsResponse> getAllOrdersForExport(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        List<Order> orders = adminStatisticsRepository.findOrdersWithDateRange(
                fromDateTime, toDateTime, Pageable.unpaged()).getContent();
        
        return orders.stream().map(this::mapToOrderStatistics).collect(Collectors.toList());
    }
@Transactional(readOnly = true)
    private OrderStatisticsResponse mapToOrderStatistics(Order order) {
        return OrderStatisticsResponse.builder()
                .id(order.getId())
                .buyerName(order.getBuyer() != null ? order.getBuyer().getFullName() : "N/A")
                .sellerName(order.getSeller() != null ? order.getSeller().getFullName() : "N/A")
                .status(order.getStatus() != null ? order.getStatus().name() : "")
                .statusDisplayName(order.getStatus() != null ? order.getStatus().getDisplayName() : "")
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "")
                .totalAmount(order.getTotalAmount())
                .platformFee(order.getPlatformFee())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    // ============== USERS STATISTICS ==============
@Transactional(readOnly = true)
    public Page<UserStatisticsResponse> getUsersStatistics(LocalDate fromDate, LocalDate toDate, int page, int size) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<Users> usersPage = usersRepository.findByCreatedAtBetween(fromDateTime, toDateTime, pageable);

        return usersPage.map(this::mapToUserStatistics);
    }
@Transactional(readOnly = true)
    public List<UserStatisticsResponse> getAllUsersForExport(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        List<Users> users = usersRepository.findByCreatedAtBetween(
                fromDateTime, toDateTime, Pageable.unpaged()).getContent();
        
        return users.stream().map(this::mapToUserStatistics).collect(Collectors.toList());
    }
@Transactional(readOnly = true)
    private UserStatisticsResponse mapToUserStatistics(Users user) {
        Set<String> roles = user.getRoles() != null 
                ? user.getRoles().stream().map(Roles::getName).collect(Collectors.toSet())
                : Set.of();

        Long totalPosts = postsRepository.countByUser(user);
        Long totalOrders = orderRepository.countCompletedByBuyerId(user.getId()) 
                + orderRepository.countCompletedBySellerId(user.getId());

        return UserStatisticsResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .dob(user.getDob())
                .createdAt(user.getCreatedAt())
                .active(user.isActive())
                .roles(roles)
                .totalPosts(totalPosts)
                .totalOrders(totalOrders)
                .build();
    }

    // ============== REPORTS STATISTICS ==============
    @Transactional(readOnly = true)
    public Page<ReportStatisticsResponse> getReportsStatistics(LocalDate fromDate, LocalDate toDate, int page, int size) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<Report> reportsPage = reportRepository.findByCreatedAtBetween(fromDateTime, toDateTime, pageable);

        return reportsPage.map(this::mapToReportStatistics);
    }
@Transactional(readOnly = true)
    public List<ReportStatisticsResponse> getAllReportsForExport(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        List<Report> reports = reportRepository.findByCreatedAtBetween(
                fromDateTime, toDateTime, Pageable.unpaged()).getContent();
        
        return reports.stream().map(this::mapToReportStatistics).collect(Collectors.toList());
    }
@Transactional(readOnly = true)
    private ReportStatisticsResponse mapToReportStatistics(Report report) {
        return ReportStatisticsResponse.builder()
                .id(report.getId())
                .reason(report.getReason() != null ? report.getReason().name() : "")
                .reasonDisplayName(report.getReason() != null ? report.getReason().getDisplayName() : "")
                .type(report.getType() != null ? report.getType().name() : "")
                .typeDisplayName(report.getType() != null ? report.getType().getDisplayName() : "")
                .status(report.getStatus() != null ? report.getStatus().name() : "")
                .statusDisplayName(report.getStatus() != null ? report.getStatus().getDisplayName() : "")
                .reporterName(report.getReporter() != null ? report.getReporter().getFullName() : "N/A")
                .reportedUserName(report.getReportedUser() != null ? report.getReportedUser().getFullName() : null)
                .postTitle(report.getReportedPost() != null ? report.getReportedPost().getTitle() : null)
                .orderId(report.getOrder() != null ? report.getOrder().getId() : null)
                .resolutionNote(report.getResolutionNote())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
