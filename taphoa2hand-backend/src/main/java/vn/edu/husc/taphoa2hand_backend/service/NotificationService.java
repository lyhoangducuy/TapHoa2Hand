package vn.edu.husc.taphoa2hand_backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.corundumstudio.socketio.SocketIOServer;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Noti.NotificationResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Notification;
import vn.edu.husc.taphoa2hand_backend.mapper.NotificationMapper;
import vn.edu.husc.taphoa2hand_backend.repository.NotificationRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {
    NotificationRepository notificationRepository;
    SocketIOServer socketIOServer;
    NotificationMapper notificationMapper;

   public List<NotificationResponse> createNotification(NotificationRequest request) {
        List<Notification> notifications = new ArrayList<>();

        // 1. Chuẩn bị danh sách Entity cần lưu
        for (String recipientId : request.getRecipientId()) {
            Notification notification = Notification.builder()
                .recipientId(recipientId)
                .content(request.getContent())
                // .link(request.getLink()) // Nếu có
                .build();
            notifications.add(notification);
        }

        // 2. Lưu Batch: 1000 bản ghi cũng chỉ mất 1-2 lần gọi DB
        List<Notification> savedNotifications = notificationRepository.saveAll(notifications);

        // 3. Map sang Response và bắn Socket.IO cho từng user
        List<NotificationResponse> responses = new ArrayList<>();
        
        for (Notification noti : savedNotifications) {
            NotificationResponse response = mapToResponse(noti);
            responses.add(response);

            // Bắn sự kiện tới đúng Room của từng user
            socketIOServer.getRoomOperations(noti.getRecipientId())
                          .sendEvent("new_notification", response);
        }

        return responses;
}

    // 2. LẤY DANH SÁCH THEO USER
    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 3. ĐÁNH DẤU ĐÃ ĐỌC
    public NotificationResponse markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        
        notification.setRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    // 4. XÓA THÔNG BÁO
    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    // Hàm phụ trợ chuyển Entity -> DTO Response
    private NotificationResponse mapToResponse(Notification notification) {
        return notificationMapper.toNotificationResponse(notification);
    }
}
