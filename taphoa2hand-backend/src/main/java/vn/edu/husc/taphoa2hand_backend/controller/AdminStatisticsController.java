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
