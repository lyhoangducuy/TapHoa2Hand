package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportOrderSubmitRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportPostSubmitRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportUpdateStatusRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportUserSubmitRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.FilesResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.Report;
import vn.edu.husc.taphoa2hand_backend.entity.ReportEvidence;
import vn.edu.husc.taphoa2hand_backend.entity.ReportStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.ReportTypeEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.ReportMapper;
import vn.edu.husc.taphoa2hand_backend.repository.OrderRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostsRepository;
import vn.edu.husc.taphoa2hand_backend.repository.ReportRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReportService {

    ReportRepository reportRepository;
    UsersRepository usersRepository;
    OrderRepository orderRepository;
    PostsRepository postsRepository;
    ReportMapper reportMapper;
    FileService fileService;

    private Users currentReporter() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return usersRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    /** Upload ảnh minh chứng (tối đa 10 file/part) qua {@link FileService#uploadMedia}. */
    private void attachEvidenceImages(Report report, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }
        List<ReportEvidence> evidences = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            try {
                FilesResponse uploadResponse = fileService.uploadMedia(file);
                evidences.add(ReportEvidence.builder()
                        .imageUrl(uploadResponse.getUrl())
                        .report(report)
                        .build());
            } catch (IOException e) {
                log.error("Failed to upload evidence file: {}", file.getOriginalFilename(), e);
                throw new AppException(ErrorCode.SAVE_FILE_ERRROR);
            }
        }
        if (!evidences.isEmpty()) {
            report.setEvidences(evidences);
        }
    }

    @Transactional
    public ReportResponse submitUserReport(ReportUserSubmitRequest body) {
        Users reporter = currentReporter();
        Users reported = usersRepository.findById(body.getReportedUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (reported.getId().equals(reporter.getId())) {
            throw new AppException(ErrorCode.REPORT_CANNOT_SELF);
        }
        Report report = Report.builder()
                .reason(body.getReason().trim())
                .type(ReportTypeEnum.USER)
                .reporter(reporter)
                .reportedUser(reported)
                .status(ReportStatusEnum.PENDING)
                .evidences(new ArrayList<>())
                .build();
        attachEvidenceImages(report, body.getEvidenceImages());
        return reportMapper.toReportResponse(reportRepository.save(report));
    }

    @Transactional
    public ReportResponse submitPostReport(ReportPostSubmitRequest body) {
        Users reporter = currentReporter();
        Posts post = postsRepository.findById(body.getPostId())
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        if (post.getUser() != null && post.getUser().getId().equals(reporter.getId())) {
            throw new AppException(ErrorCode.REPORT_OWN_POST);
        }
        Report report = Report.builder()
                .reason(body.getReason().trim())
                .type(ReportTypeEnum.POST)
                .reporter(reporter)
                .reportedPost(post)
                .reportedUser(post.getUser())
                .status(ReportStatusEnum.PENDING)
                .evidences(new ArrayList<>())
                .build();
        attachEvidenceImages(report, body.getEvidenceImages());
        return reportMapper.toReportResponse(reportRepository.save(report));
    }

    @Transactional
    public ReportResponse submitOrderReport(ReportOrderSubmitRequest body) {
        Users reporter = currentReporter();
        Order order = orderRepository.findById(body.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        boolean participant = order.getBuyer().getId().equals(reporter.getId())
                || order.getSeller().getId().equals(reporter.getId());
        if (!participant) {
            throw new AppException(ErrorCode.REPORT_ORDER_FORBIDDEN);
        }
        Report report = Report.builder()
                .reason(body.getReason().trim())
                .type(ReportTypeEnum.ORDER)
                .reporter(reporter)
                .order(order)
                .status(ReportStatusEnum.PENDING)
                .evidences(new ArrayList<>())
                .build();
        attachEvidenceImages(report, body.getEvidenceImages());
        return reportMapper.toReportResponse(reportRepository.save(report));
    }

    @Transactional
    public ReportResponse createReport(ReportCreateRequest request) {
        Users reporter = currentReporter();

        Report report = reportMapper.toReport(request);
        report.setReporter(reporter);
        report.setStatus(ReportStatusEnum.PENDING);

        if (request.getReportedUserId() != null && !request.getReportedUserId().isBlank()) {
            Users reportedUser = usersRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            report.setReportedUser(reportedUser);
        }

        if (request.getOrderId() != null && !request.getOrderId().isBlank()) {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
            report.setOrder(order);
        }

        if (request.getPostId() != null && !request.getPostId().isBlank()) {
            Posts post = postsRepository.findById(request.getPostId())
                    .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
            report.setReportedPost(post);
        }

        attachEvidenceImages(report, request.getEvidenceImages());

        Report savedReport = reportRepository.save(report);
        return reportMapper.toReportResponse(savedReport);
    }

    public List<ReportResponse> getReportsByReporter() {
        Users reporter = currentReporter();
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
