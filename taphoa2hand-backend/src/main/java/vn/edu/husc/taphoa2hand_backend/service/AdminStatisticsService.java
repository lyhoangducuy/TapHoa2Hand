package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.edu.husc.taphoa2hand_backend.dto.response.Statistics.*;
import vn.edu.husc.taphoa2hand_backend.entity.*;
import vn.edu.husc.taphoa2hand_backend.repository.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ============== SUMMARY ==============

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
        Long pendingReports = reportRepository.countByStatus(ReportStatusEnum.PENDING);
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

    // ============== ORDERS STATISTICS ==============

    public Page<OrderStatisticsResponse> getOrdersStatistics(LocalDate fromDate, LocalDate toDate, int page, int size) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<Order> ordersPage = adminStatisticsRepository.findOrdersWithDateRange(fromDateTime, toDateTime, pageable);

        return ordersPage.map(this::mapToOrderStatistics);
    }

    public List<OrderStatisticsResponse> getAllOrdersForExport(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        // Get all orders without pagination for export
        List<Order> orders = adminStatisticsRepository.findOrdersWithDateRange(
                fromDateTime, toDateTime, Pageable.unpaged()).getContent();
        
        return orders.stream().map(this::mapToOrderStatistics).collect(Collectors.toList());
    }

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

    public Page<UserStatisticsResponse> getUsersStatistics(LocalDate fromDate, LocalDate toDate, int page, int size) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<Users> usersPage = usersRepository.findByCreatedAtBetween(fromDateTime, toDateTime, pageable);

        return usersPage.map(this::mapToUserStatistics);
    }

    public List<UserStatisticsResponse> getAllUsersForExport(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        List<Users> users = usersRepository.findByCreatedAtBetween(
                fromDateTime, toDateTime, Pageable.unpaged()).getContent();
        
        return users.stream().map(this::mapToUserStatistics).collect(Collectors.toList());
    }

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

    public Page<ReportStatisticsResponse> getReportsStatistics(LocalDate fromDate, LocalDate toDate, int page, int size) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<Report> reportsPage = reportRepository.findByCreatedAtBetween(fromDateTime, toDateTime, pageable);

        return reportsPage.map(this::mapToReportStatistics);
    }

    public List<ReportStatisticsResponse> getAllReportsForExport(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        List<Report> reports = reportRepository.findByCreatedAtBetween(
                fromDateTime, toDateTime, Pageable.unpaged()).getContent();
        
        return reports.stream().map(this::mapToReportStatistics).collect(Collectors.toList());
    }

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
