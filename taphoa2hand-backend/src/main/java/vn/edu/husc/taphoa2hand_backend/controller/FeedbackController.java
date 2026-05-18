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
import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackResponse;
import vn.edu.husc.taphoa2hand_backend.service.FeedbackService;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','ADMIN')")
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

    @GetMapping("/{orderId}")
    public ApiResponse<FeedbackResponse> getFeedbackByOrderId(@PathVariable String orderId) {
        return ApiResponse.<FeedbackResponse>builder()
                .message("Lấy đánh giá theo đơn hàng thành công")
                .result(feedbackService.getFeedbackByOrderId(orderId))
                .build();
    }
}
