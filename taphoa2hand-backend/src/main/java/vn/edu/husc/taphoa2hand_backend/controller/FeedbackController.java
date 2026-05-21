package vn.edu.husc.taphoa2hand_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.IOException;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import vn.edu.husc.taphoa2hand_backend.dto.request.FeedbackDTO;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.AverageRatingResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackFullResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackResponse;
import vn.edu.husc.taphoa2hand_backend.service.FeedbackService;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackController {
    FeedbackService feedbackService;

    @PostMapping("/create")
    public ApiResponse<FeedbackResponse> createFeedback(
            @RequestPart("data") @Valid FeedbackDTO dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        return ApiResponse.<FeedbackResponse>builder()
                .message("Tạo đánh giá thành công")
                .result(feedbackService.createFeedback(dto, images))
                .build();
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<FeedbackResponse> getFeedbackByOrderId(@PathVariable String orderId) {
        return ApiResponse.<FeedbackResponse>builder()
                .message("Lấy đánh giá theo đơn hàng thành công")
                .result(feedbackService.getFeedbackByOrderId(orderId))
                .build();
    }

    @GetMapping("/average/{userId}")
    public ApiResponse<AverageRatingResponse> getAverageRating(@PathVariable String userId) {
        return ApiResponse.<AverageRatingResponse>builder()
                .message("Lấy trung bình rating thành công")
                .result(feedbackService.getAverageRating(userId))
                .build();
    }

    @GetMapping("/full/{userId}")
    public ApiResponse<List<FeedbackFullResponse>> getFeedbackFull(@PathVariable String userId) {
        return ApiResponse.<List<FeedbackFullResponse>>builder()
                .message("Lấy feedback + order + post thành công")
                .result(feedbackService.getFeedbackWithOrderPost(userId))
                .build();
    }

    // User cập nhật đánh giá của chính mình
    @PutMapping("/{feedbackId}")
    public ApiResponse<FeedbackResponse> updateFeedback(
            @PathVariable String feedbackId,
            @RequestBody FeedbackDTO dto) {
        return ApiResponse.<FeedbackResponse>builder()
                .message("Cập nhật đánh giá thành công")
                .result(feedbackService.updateFeedback(feedbackId, dto))
                .build();
    }

    // ─── ADMIN ENDPOINTS ───

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<org.springframework.data.domain.Page<FeedbackResponse>> adminGetAllFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.<org.springframework.data.domain.Page<FeedbackResponse>>builder()
                .message("Lấy danh sách đánh giá thành công")
                .result(feedbackService.adminGetAllFeedbacks(page, size, keyword))
                .build();
    }

    @PutMapping("/admin/{feedbackId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FeedbackResponse> adminUpdateFeedback(
            @PathVariable String feedbackId,
            @RequestBody FeedbackDTO dto) {
        return ApiResponse.<FeedbackResponse>builder()
                .message("Admin cập nhật đánh giá thành công")
                .result(feedbackService.updateFeedback(feedbackId, dto))
                .build();
    }

    @DeleteMapping("/admin/{feedbackId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> adminDeleteFeedback(@PathVariable String feedbackId) {
        feedbackService.deleteFeedback(feedbackId);
        return ApiResponse.<Void>builder()
                .message("Xóa đánh giá thành công")
                .build();
    }

    @GetMapping("/admin/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<org.springframework.data.domain.Page<FeedbackResponse>> adminGetFeedbacksByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<org.springframework.data.domain.Page<FeedbackResponse>>builder()
                .message("Lấy đánh giá theo người dùng thành công")
                .result(feedbackService.adminGetFeedbacksByUser(userId, page, size))
                .build();
    }
}
