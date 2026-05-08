// package vn.edu.husc.taphoa2hand_backend.controller;

// import lombok.RequiredArgsConstructor;
// import lombok.experimental.FieldDefaults;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.domain.Sort;
// import org.springframework.data.web.PageableDefault;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;
// import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
// import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackResponse;
// import vn.edu.husc.taphoa2hand_backend.service.FeedbackService;

// @RestController
// @RequestMapping("/admin/feedbacks")
// @RequiredArgsConstructor
// @PreAuthorize("hasRole('ADMIN')")
// @FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
// public class AdminFeedbackController {
    
//     FeedbackService feedbackService;
    
//     @GetMapping
//     public ApiResponse<Page<FeedbackResponse>> getAllFeedbacks(
//             @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
//         return ApiResponse.<Page<FeedbackResponse>>builder()
//                 .message("Lấy danh sách đánh giá thành công")
//                 .result(feedbackService.getAllFeedbacks(pageable))
//                 .build();
//     }
    
//     @DeleteMapping("/{feedbackId}")
//     public ApiResponse<Void> deleteFeedback(@PathVariable String feedbackId) {
//         feedbackService.deleteFeedback(feedbackId);
//         return ApiResponse.<Void>builder()
//                 .message("Xóa đánh giá thành công")
//                 .build();
//     }
    
//     @GetMapping("/user/{targetUserId}")
//     public ApiResponse<Page<FeedbackResponse>> getFeedbacksByUser(
//             @PathVariable String targetUserId,
//             @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
//         return ApiResponse.<Page<FeedbackResponse>>builder()
//                 .message("Lấy danh sách đánh giá của người dùng thành công")
//                 .result(feedbackService.getFeedbackByTargetUser(targetUserId, pageable))
//                 .build();
//     }
// }
