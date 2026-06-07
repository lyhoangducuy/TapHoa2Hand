package vn.edu.husc.taphoa2hand_backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Statistics.*;
import vn.edu.husc.taphoa2hand_backend.service.AdminStatisticsService;
import vn.edu.husc.taphoa2hand_backend.service.ExcelExportService;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatisticsController {

    private final AdminStatisticsService statisticsService;
    private final ExcelExportService excelExportService;

    // ============== DASHBOARD OVERVIEW ==============

    @GetMapping("/overview")
    public ApiResponse<DashboardOverviewResponse> getDashboardOverview() {
        log.info("Getting dashboard overview");
        DashboardOverviewResponse overview = statisticsService.getDashboardOverview();
        return ApiResponse.<DashboardOverviewResponse>builder()
                .code(1000)
                .message("Dashboard overview")
                .result(overview)
                .build();
    }

    // ============== SUMMARY ==============

    @GetMapping("/summary")
    public ApiResponse<StatisticsSummaryResponse> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        log.info("Getting statistics summary from {} to {}", fromDate, toDate);
        StatisticsSummaryResponse summary = statisticsService.getSummary(fromDate, toDate);
        
        return ApiResponse.<StatisticsSummaryResponse>builder()
                .code(1000)
                .message("Thống kê tổng quan")
                .result(summary)
                .build();
    }

    // ============== CHARTS ==============

    @GetMapping("/revenue-chart")
    public ApiResponse<List<RevenueChartItem>> getRevenueChart(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        log.info("Getting revenue chart from {} to {}", fromDate, toDate);
        List<RevenueChartItem> chartData = statisticsService.getRevenueChart(fromDate, toDate);
        
        return ApiResponse.<List<RevenueChartItem>>builder()
                .code(1000)
                .message("Biểu đồ doanh thu")
                .result(chartData)
                .build();
    }

    @GetMapping("/revenue-by-month")
    public ApiResponse<List<RevenueChartItem>> getRevenueByMonth(
            @RequestParam(defaultValue = "2026") int year) {
        
        log.info("Getting revenue by month for year {}", year);
        List<RevenueChartItem> chartData = statisticsService.getRevenueByMonth(year);
        
        return ApiResponse.<List<RevenueChartItem>>builder()
                .code(1000)
                .message("Doanh thu theo tháng")
                .result(chartData)
                .build();
    }

    @GetMapping("/order-status-distribution")
    public ApiResponse<List<OrderStatusCount>> getOrderStatusDistribution() {
        log.info("Getting order status distribution");
        List<OrderStatusCount> data = statisticsService.getOrderStatusDistribution();
        return ApiResponse.<List<OrderStatusCount>>builder()
                .code(1000)
                .message("Phân bố trạng thái đơn hàng")
                .result(data)
                .build();
    }

    @GetMapping("/posts-by-category")
    public ApiResponse<List<CategoryPostCount>> getPostsByCategory() {
        log.info("Getting posts by category");
        List<CategoryPostCount> data = statisticsService.getPostsByCategory();
        return ApiResponse.<List<CategoryPostCount>>builder()
                .code(1000)
                .message("Bài đăng theo danh mục")
                .result(data)
                .build();
    }

    @GetMapping("/report-reasons")
    public ApiResponse<List<ReportReasonCount>> getReportReasonsDistribution() {
        log.info("Getting report reasons distribution");
        List<ReportReasonCount> data = statisticsService.getReportReasonsDistribution();
        return ApiResponse.<List<ReportReasonCount>>builder()
                .code(1000)
                .message("Lý do báo cáo")
                .result(data)
                .build();
    }

    @GetMapping("/top-sellers")
    public ApiResponse<List<TopSellerResponse>> getTopSellers(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("Getting top {} sellers", limit);
        List<TopSellerResponse> data = statisticsService.getTopSellers(limit);
        return ApiResponse.<List<TopSellerResponse>>builder()
                .code(1000)
                .message("Top người bán")
                .result(data)
                .build();
    }

    @GetMapping("/top-reported-users")
    public ApiResponse<List<TopReportedUserResponse>> getTopReportedUsers(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("Getting top {} reported users", limit);
        List<TopReportedUserResponse> data = statisticsService.getTopReportedUsers(limit);
        return ApiResponse.<List<TopReportedUserResponse>>builder()
                .code(1000)
                .message("Top người dùng bị báo cáo")
                .result(data)
                .build();
    }

    @GetMapping("/rating-distribution")
    public ApiResponse<List<RatingDistribution>> getRatingDistribution() {
        log.info("Getting rating distribution");
        List<RatingDistribution> data = statisticsService.getRatingDistribution();
        return ApiResponse.<List<RatingDistribution>>builder()
                .code(1000)
                .message("Phân bố đánh giá")
                .result(data)
                .build();
    }

    @GetMapping("/ai-assessment-distribution")
    public ApiResponse<List<AiAssessmentCount>> getAiAssessmentDistribution() {
        log.info("Getting AI assessment distribution");
        List<AiAssessmentCount> data = statisticsService.getAiAssessmentDistribution();
        return ApiResponse.<List<AiAssessmentCount>>builder()
                .code(1000)
                .message("Kết quả kiểm định AI")
                .result(data)
                .build();
    }

    @GetMapping("/recent-activities")
    public ApiResponse<List<RecentActivity>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Getting recent activities, limit={}", limit);
        List<RecentActivity> data = statisticsService.getRecentActivities(limit);
        return ApiResponse.<List<RecentActivity>>builder()
                .code(1000)
                .message("Hoạt động gần đây")
                .result(data)
                .build();
    }

    // ============== ORDERS ==============

    @GetMapping("/orders")
    public ApiResponse<Page<OrderStatisticsResponse>> getOrdersStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting orders statistics from {} to {}, page={}, size={}", fromDate, toDate, page, size);
        Page<OrderStatisticsResponse> orders = statisticsService.getOrdersStatistics(fromDate, toDate, page, size);
        
        return ApiResponse.<Page<OrderStatisticsResponse>>builder()
                .code(1000)
                .message("Danh sách đơn hàng")
                .result(orders)
                .build();
    }

    @GetMapping("/export/orders")
    public void exportOrdersExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            HttpServletResponse response) throws IOException {
        
        log.info("Exporting orders from {} to {}", fromDate, toDate);
        List<OrderStatisticsResponse> orders = statisticsService.getAllOrdersForExport(fromDate, toDate);
        String filename = excelExportService.generateFilename("orders-report");
        
        excelExportService.exportOrdersToExcel(orders, response, filename);
    }

    // ============== USERS ==============

    @GetMapping("/users")
    public ApiResponse<Page<UserStatisticsResponse>> getUsersStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting users statistics from {} to {}, page={}, size={}", fromDate, toDate, page, size);
        Page<UserStatisticsResponse> users = statisticsService.getUsersStatistics(fromDate, toDate, page, size);
        
        return ApiResponse.<Page<UserStatisticsResponse>>builder()
                .code(1000)
                .message("Danh sách người dùng")
                .result(users)
                .build();
    }

    @GetMapping("/export/users")
    public void exportUsersExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            HttpServletResponse response) throws IOException {
        
        log.info("Exporting users from {} to {}", fromDate, toDate);
        List<UserStatisticsResponse> users = statisticsService.getAllUsersForExport(fromDate, toDate);
        String filename = excelExportService.generateFilename("users-report");
        
        excelExportService.exportUsersToExcel(users, response, filename);
    }

    // ============== REPORTS ==============

    @GetMapping("/reports")
    public ApiResponse<Page<ReportStatisticsResponse>> getReportsStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting reports statistics from {} to {}, page={}, size={}", fromDate, toDate, page, size);
        Page<ReportStatisticsResponse> reports = statisticsService.getReportsStatistics(fromDate, toDate, page, size);
        
        return ApiResponse.<Page<ReportStatisticsResponse>>builder()
                .code(1000)
                .message("Danh sách báo cáo")
                .result(reports)
                .build();
    }

    @GetMapping("/export/reports")
    public void exportReportsExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            HttpServletResponse response) throws IOException {
        
        log.info("Exporting reports from {} to {}", fromDate, toDate);
        List<ReportStatisticsResponse> reports = statisticsService.getAllReportsForExport(fromDate, toDate);
        String filename = excelExportService.generateFilename("reports-report");
        
        excelExportService.exportReportsToExcel(reports, response, filename);
    }

    // ============== REVENUE EXPORT ==============

    @GetMapping("/export/revenue")
    public void exportRevenueExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            HttpServletResponse response) throws IOException {
        
        log.info("Exporting revenue from {} to {}", fromDate, toDate);
        List<RevenueChartItem> revenueData = statisticsService.getRevenueChart(fromDate, toDate);
        String filename = excelExportService.generateFilename("revenue-report");
        
        excelExportService.exportRevenueToExcel(revenueData, response, filename);
    }
}
