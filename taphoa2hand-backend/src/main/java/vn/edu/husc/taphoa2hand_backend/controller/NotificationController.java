package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.firebase.internal.FirebaseService;
import com.google.firebase.messaging.Notification;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationMessage;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
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
    public ApiResponse<String> sendNotificationByToken(@RequestBody NotificationMessage notificationMessage){
        return ApiResponse.<String>builder()
            
            .result(firebaseMessagingService.sendNotificationByToken(notificationMessage))
            .build();
    } 
    @PostMapping
    public ApiResponse<List<NotificationResponse>> createNotification(@RequestBody NotificationRequest request) {
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.createNotification(request))
                .build();
    }

    // 2. LẤY DANH SÁCH THÔNG BÁO (Frontend gọi api này khi load Header)
    @GetMapping("/user/{userId}")
    public ApiResponse<List<NotificationResponse>> getUserNotifications(@PathVariable String userId) {
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getUserNotifications(userId))
                .build();
    }

    // 3. ĐÁNH DẤU LÀ ĐÃ ĐỌC (Frontend gọi khi user click vào 1 thông báo)
    @PutMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable String id) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.markAsRead(id))
                .build();
    }

    // 4. XÓA THÔNG BÁO (Cho admin quản lý)
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ApiResponse.<String>builder()
                .result("Đã xóa thông báo thành công")
                .build();
    }
    
}
