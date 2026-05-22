package vn.edu.husc.taphoa2hand_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.*;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.PageResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.ReportReasonResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportResponse;
import vn.edu.husc.taphoa2hand_backend.entity.ReportStatusEnum;
import vn.edu.husc.taphoa2hand_backend.service.ReportService;

import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ReportController {

    ReportService reportService;

    // ═══════════════════════════════════════════
    // USER APIs
    // ═══════════════════════════════════════════

    @PostMapping(value = "/submit/user", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ReportResponse> submitUserReport(@Valid @ModelAttribute ReportUserSubmitRequest body) {
        return ApiResponse.<ReportResponse>builder()
                .message("Đã gửi báo cáo người dùng")
                .result(reportService.submitUserReport(body))
                .build();
    }

    @PostMapping(value = "/submit/post", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ReportResponse> submitPostReport(@Valid @ModelAttribute ReportPostSubmitRequest body) {
        return ApiResponse.<ReportResponse>builder()
                .message("Đã gửi báo cáo bài đăng")
                .result(reportService.submitPostReport(body))
                .build();
    }

    @PostMapping(value = "/submit/order", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ReportResponse> submitOrderReport(@Valid @ModelAttribute ReportOrderSubmitRequest body) {
        return ApiResponse.<ReportResponse>builder()
                .message("Đã gửi báo cáo đơn hàng")
                .result(reportService.submitOrderReport(body))
                .build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ReportResponse> createReport(@Valid @ModelAttribute ReportCreateRequest request) {
        return ApiResponse.<ReportResponse>builder()
                .message("Đã tạo báo cáo")
                .result(reportService.createReport(request))
                .build();
    }

    @GetMapping("/my-reports")
    public ApiResponse<List<ReportResponse>> getMyReports() {
        return ApiResponse.<List<ReportResponse>>builder()
                .result(reportService.getReportsByReporter())
                .build();
    }

    @GetMapping("/my-reports/paged")
    public ApiResponse<PageResponse<ReportResponse>> getMyReportsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<ReportResponse>>builder()
                .result(reportService.getMyReportsPaged(page, size))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ReportResponse> getReportById(@PathVariable String id) {
        return ApiResponse.<ReportResponse>builder()
                .result(reportService.getReportById(id))
                .build();
    }

    @GetMapping("/reasons")
    public ApiResponse<List<ReportReasonResponse>> getReportReasons() {
        return ApiResponse.<List<ReportReasonResponse>>builder()
                .result(reportService.getReportReasons())
                .build();
    }

    // ═══════════════════════════════════════════
    // ADMIN APIs
    // ═══════════════════════════════════════════

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<List<ReportResponse>> getAllReports() {
        return ApiResponse.<List<ReportResponse>>builder()
                .result(reportService.getAllReports())
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/paged")
    public ApiResponse<PageResponse<ReportResponse>> getReportsPaged(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ReportStatusEnum status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        ReportFilterRequest filter = ReportFilterRequest.builder()
                .keyword(keyword)
                .status(status)
                .type(type)
                .fromDate(fromDate)
                .toDate(toDate)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDir(sortDir)
                .build();

        return ApiResponse.<PageResponse<ReportResponse>>builder()
                .result(reportService.getReportsPaged(filter))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public ApiResponse<List<ReportResponse>> getReportsByStatus(@PathVariable ReportStatusEnum status) {
        return ApiResponse.<List<ReportResponse>>builder()
                .result(reportService.getReportsByStatus(status))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ApiResponse<Map<String, Long>> getReportStats() {
        return ApiResponse.<Map<String, Long>>builder()
                .result(reportService.getReportStats())
                .build();
    }

    /** Cập nhật trạng thái đơn giản (chỉ status) */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ApiResponse<ReportResponse> updateReportStatus(
            @PathVariable String id,
            @Valid @RequestBody ReportUpdateStatusRequest request) {
        return ApiResponse.<ReportResponse>builder()
                .result(reportService.updateReportStatus(id, request))
                .build();
    }

    /** Review + áp dụng penalties (đầy đủ) */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/review")
    public ApiResponse<ReportResponse> reviewReport(
            @PathVariable String id,
            @Valid @RequestBody ReportReviewRequest request) {
        return ApiResponse.<ReportResponse>builder()
                .message("Đã review báo cáo")
                .result(reportService.reviewReport(id, request))
                .build();
    }
}
