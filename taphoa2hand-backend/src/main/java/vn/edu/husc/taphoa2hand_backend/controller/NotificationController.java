package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationMessage;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Noti.NotificationAdminResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Noti.NotificationResponse;
import vn.edu.husc.taphoa2hand_backend.service.FirebaseMessagingService;
import vn.edu.husc.taphoa2hand_backend.service.NotificationService;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {
    FirebaseMessagingService firebaseMessagingService;
    NotificationService notificationService;

    @PostMapping("/send-token")
    public ApiResponse<String> sendNotificationByToken(@RequestBody NotificationMessage notificationMessage) {
        return ApiResponse.<String>builder()
                .result(firebaseMessagingService.sendNotificationByToken(notificationMessage))
                .build();
    }

    @PostMapping("/create")
    public ApiResponse<NotificationResponse> createNotification(@RequestBody NotificationRequest request) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.createNotification(request))
                .build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<NotificationResponse>> getUserNotifications(@PathVariable String userId) {
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getUserNotifications(userId))
                .build();
    }

    @GetMapping("/{userId}")
    public ApiResponse<Long> getNotiUnread(@PathVariable String userId) {
        return ApiResponse.<Long>builder()
                .result(notificationService.getUnread(userId))
                .build();
    }

    @PutMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable String id) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.markAsRead(id))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa thông báo thành công")
                .build();
    }

    @GetMapping("/admin/all")
    public ApiResponse<List<NotificationAdminResponse>> getAdminNotificationsAll() {
        return ApiResponse.<List<NotificationAdminResponse>>builder()
                .result(notificationService.getAdminNotificationsWithAdminInfo())
                .build();
    }

    @GetMapping("/admin/page")
    public ApiResponse<org.springframework.data.domain.Page<NotificationAdminResponse>> getAdminNotificationsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<org.springframework.data.domain.Page<NotificationAdminResponse>>builder()
                .result(notificationService.getAdminNotificationsWithAdminInfo(pageable))
                .build();
    }
}
