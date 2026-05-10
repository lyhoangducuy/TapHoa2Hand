package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportUpdateStatusRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportResponse;
import vn.edu.husc.taphoa2hand_backend.entity.*;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.ReportMapper;
import vn.edu.husc.taphoa2hand_backend.repository.OrderRepository;
import vn.edu.husc.taphoa2hand_backend.repository.ReportRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;
import vn.edu.husc.taphoa2hand_backend.service.FileService;

import java.util.List;
import java.util.stream.Collectors;
import java.io.IOException;
import java.util.ArrayList;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.husc.taphoa2hand_backend.dto.response.FilesResponse;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReportService {

    ReportRepository reportRepository;
    UsersRepository usersRepository;
    OrderRepository orderRepository;
    ReportMapper reportMapper;
    FileService fileService;

    @Transactional
    public ReportResponse createReport(ReportCreateRequest request) {
        // Get current user
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Users reporter = usersRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Report report = reportMapper.toReport(request);
        report.setReporter(reporter);
        report.setStatus(ReportStatusEnum.PENDING);

        // Set reported user if provided
        if (request.getReportedUserId() != null) {
            Users reportedUser = usersRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            report.setReportedUser(reportedUser);
        }

        // Set order if provided
        if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
            report.setOrder(order);
        }

        // Create evidences
        if (request.getEvidenceImages() != null && !request.getEvidenceImages().isEmpty()) {
            List<ReportEvidence> evidences = new ArrayList<>();
            for (MultipartFile file : request.getEvidenceImages()) {
                try {
                    FilesResponse uploadResponse = fileService.uploadMedia(file);
                    ReportEvidence evidence = ReportEvidence.builder()
                            .imageUrl(uploadResponse.getUrl())
                            .report(report)
                            .build();
                    evidences.add(evidence);
                } catch (IOException e) {
                    log.error("Failed to upload evidence file: {}", file.getOriginalFilename(), e);
                    throw new AppException(ErrorCode.SAVE_FILE_ERRROR);
                }
            }
            report.setEvidences(evidences);
        }

        Report savedReport = reportRepository.save(report);
        return reportMapper.toReportResponse(savedReport);
    }

    public List<ReportResponse> getReportsByReporter() {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Users reporter = usersRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Report> reports = reportRepository.findByReporter(reporter);
        return reportMapper.toReportResponseList(reports);
    }

    public List<ReportResponse> getAllReports() {
        List<Report> reports = reportRepository.findAll();
        return reportMapper.toReportResponseList(reports);
    }

    public List<ReportResponse> getReportsByStatus(ReportStatusEnum status) {
        List<Report> reports = reportRepository.findByStatus(status);
        return reportMapper.toReportResponseList(reports);
    }

    @Transactional
    public ReportResponse updateReportStatus(String reportId, ReportUpdateStatusRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_NOT_FOUND));

        report.setStatus(request.getStatus());
        Report updatedReport = reportRepository.save(report);
        return reportMapper.toReportResponse(updatedReport);
    }

    public ReportResponse getReportById(String reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_NOT_FOUND));

        return reportMapper.toReportResponse(report);
    }
}