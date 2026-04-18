package vn.edu.husc.taphoa2hand_backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.corundumstudio.socketio.SocketIOServer;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Noti.NotificationResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Notification;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.entity.WebSocketSession;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.NotificationMapper;
import vn.edu.husc.taphoa2hand_backend.repository.NotificationRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;
import vn.edu.husc.taphoa2hand_backend.repository.WebSocketSessionRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {
    UsersRepository usersRepository;
    NotificationRepository notificationRepository;
    SocketIOServer socketIOServer;
    NotificationMapper notificationMapper;
    WebSocketSessionRepository webSocketSessionRepository;
    WebSocketSessionService webSocketSessionService;

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public NotificationResponse createNotification(NotificationRequest request) {
        // 1. Map Request sang Entity
        Notification notification = notificationMapper.toNotification(request);

        // 2. Lấy danh sách Users
        List<Users> userIds = new ArrayList<>();
        for (String userId : request.getUserIds()) {
            userIds.add(usersRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
        }
        notification.setUserIds(userIds);

        // 3. LƯU VÀO DATABASE TRƯỚC để lấy ID và thời gian tạo
        var notiSave = notificationRepository.save(notification);

        // 4. CHUYỂN SANG DTO RESPONSE
        NotificationResponse response = notificationMapper.toNotificationResponse(notiSave);

        // 5. GỬI DTO QUA SOCKET (An toàn, không lo lỗi JSON Entity)
        // Bỏ qua Room, gửi thẳng cho tất cả mọi người (Broadcast)
        for (Users user : userIds) {
            socketIOServer.getRoomOperations(user.getUsername())
                    .sendEvent("new_notification", response);
            System.out.println("🚀 Đang gửi Noti cho phòng: ");
        }

        return response;
    }

    @Transactional
    // 2. LẤY DANH SÁCH THEO USER
    public List<NotificationResponse> getUserNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIds_IdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(notificationMapper::toNotificationResponse).toList();
    }

    @Transactional
    // 3. ĐÁNH DẤU ĐÃ ĐỌC
    public NotificationResponse markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        notification.setRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Transactional
    // 4. XÓA THÔNG BÁO
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    // Hàm phụ trợ chuyển Entity -> DTO Response
    private NotificationResponse mapToResponse(Notification notification) {
        return notificationMapper.toNotificationResponse(notification);
    }

    @Transactional(readOnly = true)
    public Long getUnread(String userId) {
        // Gọi DB đếm số thông báo của userId này mà isRead = false
        Long unreadCount = notificationRepository.countByUserIds_IdAndIsRead(userId, false);

        // Đảm bảo không bao giờ trả về null (nếu DB rỗng, count sẽ trả về 0)
        return unreadCount != null ? unreadCount : 0L;
    }
}
