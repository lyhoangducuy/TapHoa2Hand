package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.*;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.FilesResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.PageResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.ReportReasonResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Report.ReportResponse;
import vn.edu.husc.taphoa2hand_backend.entity.*;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.ReportMapper;
import vn.edu.husc.taphoa2hand_backend.repository.*;
import vn.edu.husc.taphoa2hand_backend.specification.ReportSpecification;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    NotificationService notificationService;
    RolesRepository rolesRepository;

    private Users currentReporter() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return usersRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Users currentAdmin() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return usersRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private void attachEvidenceImages(Report report, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return;
        List<ReportEvidence> evidences = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
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
        if (!evidences.isEmpty()) report.setEvidences(evidences);
    }

    private void notifyAdmins(String content, String link) {
        Set<Roles> adminRole = Set.of(rolesRepository.findById("ADMIN")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND)));
        List<Users> admins = usersRepository.findByRoles(adminRole);
        notificationService.createNotification(NotificationRequest.builder()
                .content(content)
                .userIds(admins.stream().map(Users::getId).collect(Collectors.toList()))
                .link(link)
                .build());
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
                .reason(body.getReason())
                .detail(body.getDetail())
                .type(ReportTypeEnum.USER)
                .reporter(reporter)
                .reportedUser(reported)
                .status(ReportStatusEnum.PENDING)
                .evidences(new ArrayList<>())
                .build();
        attachEvidenceImages(report, body.getEvidenceImages());
        notifyAdmins("Người dùng '" + reported.getFullName() + "' đã bị báo cáo. Vui lòng kiểm tra.",
                "/admin/reports");
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
                .reason(body.getReason())
                .type(ReportTypeEnum.POST)
                .detail(body.getDetail())
                .reporter(reporter)
                .reportedPost(post)
                .reportedUser(post.getUser())
                .status(ReportStatusEnum.PENDING)
                .evidences(new ArrayList<>())
                .build();
        attachEvidenceImages(report, body.getEvidenceImages());
        notifyAdmins("Bài đăng '" + post.getTitle() + "' đã bị báo cáo. Vui lòng kiểm tra.",
                "/admin/reports");
        return reportMapper.toReportResponse(reportRepository.save(report));
    }

    @Transactional
    public ReportResponse submitOrderReport(ReportOrderSubmitRequest body) {
        Users reporter = currentReporter();
        Order order = orderRepository.findById(body.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Kiểm tra đơn chưa bị báo cáo
        List<Report> existing = reportRepository.findByReporterAndOrder(reporter, order);
        if (!existing.isEmpty()) {
            throw new AppException(ErrorCode.REPORT_ORDER_EXISTED);
        }

        // Kiểm tra người báo cáo là buyer hoặc seller
        boolean participant = order.getBuyer().getId().equals(reporter.getId())
                || order.getSeller().getId().equals(reporter.getId());
        if (!participant) {
            throw new AppException(ErrorCode.REPORT_ORDER_FORBIDDEN);
        }

        // Kiểm tra đơn có thể bị báo cáo (không phải đã hoàn thành, đã hủy, hoặc đang báo cáo)
        OrderStatusEnum currentStatus = order.getStatus();
        if (currentStatus == OrderStatusEnum.COMPLETED || currentStatus == OrderStatusEnum.CANCELLED
                || currentStatus == OrderStatusEnum.REPORTED) {
            throw new AppException(ErrorCode.REPORT_ORDER_INVALID_STATUS);
        }

        // Lưu trạng thái cũ để phục hồi nếu bị từ chối
        order.setPreviousStatus(currentStatus);
        order.setStatus(OrderStatusEnum.REPORTED);
        orderRepository.save(order);

        // Tạo report
        Report report = Report.builder()
                .reason(body.getReason())
                .detail(body.getDetail())
                .type(ReportTypeEnum.ORDER)
                .reporter(reporter)
                .order(order)
                .status(ReportStatusEnum.PENDING)
                .evidences(new ArrayList<>())
                .build();
        attachEvidenceImages(report, body.getEvidenceImages());

        notifyAdmins("Đơn hàng #" + order.getId() + " đã bị báo cáo. Vui lòng kiểm tra.",
                "/admin/reports");

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

    @Transactional(readOnly = true)
    public PageResponse<ReportResponse> getMyReportsPaged(int page, int size, String status) {
        Users reporter = currentReporter();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Report> reports;
        if (status != null && !status.isBlank()) {
            ReportStatusEnum statusEnum = ReportStatusEnum.valueOf(status);
            reports = reportRepository.findByReporterAndStatus(reporter, statusEnum, pageable);
        } else {
            reports = reportRepository.findByReporter(reporter, pageable);
        }
        return PageResponse.from(reports, reportMapper::toReportResponse);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        List<Report> reports = reportRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return reportMapper.toReportResponseList(reports);
    }

    public PageResponse<ReportResponse> getReportsPaged(ReportFilterRequest filter) {
        Sort.Direction dir = "asc".equalsIgnoreCase(filter.getSortDir())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(
                filter.getPage(), filter.getSize(),
                Sort.by(dir, filter.getSortBy())
        );
        Page<Report> page = reportRepository.findAll(
                ReportSpecification.build(filter), pageable
        );
        return PageResponse.from(page, reportMapper::toReportResponse);
    }

    public List<ReportResponse> getReportsByStatus(ReportStatusEnum status) {
        List<Report> reports = reportRepository.findByStatus(status);
        return reportMapper.toReportResponseList(reports);
    }

    public ReportResponse getReportById(String reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_NOT_FOUND));
        return reportMapper.toReportResponse(report);
    }

    @Transactional
    public ReportResponse reviewReport(String reportId, ReportReviewRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_NOT_FOUND));
        Users admin = currentAdmin();

        // Xử lý Order report
        if (report.getType() == ReportTypeEnum.ORDER && report.getOrder() != null) {
            Order order = report.getOrder();
            ReportStatusEnum newStatus = ReportStatusEnum.valueOf(request.getStatus());

            if (newStatus == ReportStatusEnum.REJECTED) {
                // Từ chối → khôi phục trạng thái trước khi bị báo cáo
                OrderStatusEnum prevStatus = order.getPreviousStatus();
                if (prevStatus != null) {
                    order.setStatus(prevStatus);
                } else {
                    order.setStatus(OrderStatusEnum.PENDING);
                }
                order.setPreviousStatus(null);
                orderRepository.save(order);
            } else if (newStatus == ReportStatusEnum.APPROVED || newStatus == ReportStatusEnum.PROCESSED) {
                // Duyệt/Xử lý → kiểm tra penalty có REFUND_BUYER không
                boolean hasRefundBuyer = request.getPenalties() != null &&
                        request.getPenalties().contains(PenaltyActionEnum.REFUND_BUYER);

                if (hasRefundBuyer) {
                    // Thông báo cho người mua biết đơn sẽ được hoàn tiền
                    notificationService.createNotification(NotificationRequest.builder()
                            .content("Đơn hàng #" + order.getId() + " đã được duyệt hoàn tiền. Tiền sẽ được hoàn vào tài khoản của bạn trong 1-3 ngày làm việc.")
                            .userIds(List.of(order.getBuyer().getId()))
                            .link("/order/myOrder/" + order.getId())
                            .build());
                    log.info("[REPORT] Order {} hoàn tiền cho buyer", order.getId());
                }

                order.setPreviousStatus(null);
                orderRepository.save(order);
            }
        }

        report.setStatus(ReportStatusEnum.valueOf(request.getStatus()));
        report.setResolutionNote(request.getResolutionNote());
        report.setReviewedBy(admin);

        // Chỉ ghi nhận penalties, không thực thi thật sự
        if (request.getPenalties() != null && !request.getPenalties().isEmpty()) {
            List<ReportPenalty> penalties = request.getPenalties().stream()
                    .map(action -> ReportPenalty.builder()
                            .report(report)
                            .action(action)
                            .note(request.getResolutionNote())
                            .build())
                    .toList();
            report.setPenalties(penalties);

            // Chỉ log, không thực thi hành động thật
            logPenalties(report, request.getPenalties());
        }

        Report saved = reportRepository.save(report);

        // Notify reporter
        if (saved.getReporter() != null) {
            String msg = request.getStatus().equals("REJECTED")
                    ? "Báo cáo của bạn đã bị từ chối."
                    : "Báo cáo của bạn đã được xử lý. Đơn hàng đã bị hủy.";
            notificationService.createNotification(NotificationRequest.builder()
                    .content(msg)
                    .userIds(List.of(saved.getReporter().getId()))
                    .link("/my-reports")
                    .build());
        }

        return reportMapper.toReportResponse(saved);
    }

    /**
     * Chỉ log penalties, không thực thi hành động thật
     */
    private void logPenalties(Report report, List<PenaltyActionEnum> penalties) {
        Users reportedUser = report.getReportedUser();

        for (PenaltyActionEnum action : penalties) {
            switch (action) {
                case WARNING -> log.info("[PENALTY] Cảnh cáo người dùng: {}", reportedUser);
                case REMOVE_POST -> log.info("[PENALTY] Gỡ bài đăng: {} (chỉ ghi nhận, chưa thực thi)", report.getReportedPost());
                case HIDE_POST -> log.info("[PENALTY] Ẩn bài đăng: {} (chỉ ghi nhận, chưa thực thi)", report.getReportedPost());
                case FREEZE_ACCOUNT_24H -> log.info("[PENALTY] Khóa tài khoản 24h: {} (chỉ ghi nhận, chưa thực thi)", reportedUser);
                case FREEZE_ACCOUNT_7D -> log.info("[PENALTY] Khóa tài khoản 7 ngày: {} (chỉ ghi nhận, chưa thực thi)", reportedUser);
                case FREEZE_ACCOUNT_30D -> log.info("[PENALTY] Khóa tài khoản 30 ngày: {} (chỉ ghi nhận, chưa thực thi)", reportedUser);
                case PERMANENT_BAN -> log.info("[PENALTY] Khóa vĩnh viễn: {} (chỉ ghi nhận, chưa thực thi)", reportedUser);
                case STOP_ALL_TRANSACTIONS -> log.info("[PENALTY] Dừng giao dịch: {} (chỉ ghi nhận, chưa thực thi)", reportedUser);
                case REFUND_BUYER -> log.info("[PENALTY] Hoàn tiền người mua (chỉ ghi nhận, chưa thực thi)");
                case REFUND_REPORTER -> log.info("[PENALTY] Hoàn tiền người tố cáo (chỉ ghi nhận, chưa thực thi)");
                case NONE -> { }
                default -> { }
            }
        }
    }

    private void freezeUser(Users user, int hours) {
        if (user == null) return;
        user.setLockedUntil(LocalDateTime.now().plusHours(hours));
    }

    private void banUser(Users user) {
        if (user == null) return;
        user.setActive(false);
        user.setLockedUntil(LocalDateTime.now().plusYears(100));
    }

    private void stopTransactions(Users user) {
        if (user == null) return;
        user.setTransactionsStopped(true);
    }

    @Transactional
    public ReportResponse updateReportStatus(String reportId, ReportUpdateStatusRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_NOT_FOUND));
        report.setStatus(request.getStatus());
        return reportMapper.toReportResponse(reportRepository.save(report));
    }

    public List<ReportReasonResponse> getReportReasons() {
        return Arrays.stream(ReportReasonEnum.values())
                .map(reason -> ReportReasonResponse.builder()
                        .name(reason.name())
                        .displayName(reason.getDisplayName())
                        .build())
                .collect(Collectors.toList());
    }

    public Map<String, Long> getReportStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("PENDING", reportRepository.countByStatus(ReportStatusEnum.PENDING));
        stats.put("APPROVED", reportRepository.countByStatus(ReportStatusEnum.APPROVED));
        stats.put("PROCESSED", reportRepository.countByStatus(ReportStatusEnum.PROCESSED));
        stats.put("REJECTED", reportRepository.countByStatus(ReportStatusEnum.REJECTED));
        return stats;
    }

    // ═══════════════════════════════════════════
    // REPORTS BY TYPE (USER / ORDER / POST)
    // ═══════════════════════════════════════════

    /**
     * TODO: Viết logic lấy danh sách báo cáo theo loại (USER/ORDER/POST)
     */
    public List<ReportResponse> getReportsByType(String type) {
        // TODO: Implement logic here
        ReportTypeEnum reportType = ReportTypeEnum.valueOf(type);
        List<Report> reports = reportRepository.findByType(reportType);
        return reportMapper.toReportResponseList(reports);
    }

    /**
     * TODO: Viết logic lấy danh sách báo cáo theo loại có phân trang
     */
    public PageResponse<ReportResponse> getReportsByTypePaged(String type, int page, int size) {
        // TODO: Implement logic here
        ReportTypeEnum reportType = ReportTypeEnum.valueOf(type);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Report> reports = reportRepository.findByType(reportType, pageable);
        return PageResponse.from(reports, reportMapper::toReportResponse);
    }
}
