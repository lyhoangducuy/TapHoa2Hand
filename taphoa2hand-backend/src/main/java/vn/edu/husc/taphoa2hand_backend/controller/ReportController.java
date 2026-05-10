package vn.edu.husc.taphoa2hand_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportUpdateStatusRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportResponse;
import vn.edu.husc.taphoa2hand_backend.entity.ReportStatusEnum;
import vn.edu.husc.taphoa2hand_backend.service.ReportService;

import java.util.List;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ReportController {

    ReportService reportService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ReportResponse> createReport(@Valid @ModelAttribute ReportCreateRequest request) {
        return ApiResponse.<ReportResponse>builder()
                .result(reportService.createReport(request))
                .build();
    }

    @GetMapping("/my-reports")
    public ApiResponse<List<ReportResponse>> getMyReports() {
        return ApiResponse.<List<ReportResponse>>builder()
                .result(reportService.getReportsByReporter())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ReportResponse> getReportById(@PathVariable String id) {
        return ApiResponse.<ReportResponse>builder()
                .result(reportService.getReportById(id))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<List<ReportResponse>> getAllReports() {
        return ApiResponse.<List<ReportResponse>>builder()
                .result(reportService.getAllReports())
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
    @PutMapping("/{id}/status")
    public ApiResponse<ReportResponse> updateReportStatus(
            @PathVariable String id,
            @Valid @RequestBody ReportUpdateStatusRequest request) {
        return ApiResponse.<ReportResponse>builder()
                .result(reportService.updateReportStatus(id, request))
                .build();
    }
}