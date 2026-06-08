package vn.edu.husc.taphoa2hand_backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.corundumstudio.socketio.SocketIOServer;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Noti.NotificationAdminResponse;
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
    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = notificationMapper.toNotification(request);

        List<Users> userIds = new ArrayList<>();
        for (String userId : request.getUserIds()) {
            userIds.add(usersRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
        }
        notification.setUserIds(userIds);

        if (request.getCreatedBy() != null && !request.getCreatedBy().isBlank()) {
            notification.setCreatedBy(request.getCreatedBy().trim());
            return saveNotificationAndSendSocket(notification, userIds);
        }

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            var currentUser = usersRepository.findByUsername(userDetails.getUsername()).orElse(null);
            if (currentUser != null) {
                notification.setCreatedBy(currentUser.getId());
            }
        }

        return saveNotificationAndSendSocket(notification, userIds);
    }

    private NotificationResponse saveNotificationAndSendSocket(Notification notification, List<Users> userIds) {
        var notiSave = notificationRepository.save(notification);

        NotificationResponse response = notificationMapper.toNotificationResponse(notiSave);

        for (Users user : userIds) {
            socketIOServer.getRoomOperations(user.getUsername())
                    .sendEvent("new_notification", response);
            System.out.println("🚀 Đang gửi Noti cho phòng: ");
        }

        return response;
    }

    @Transactional
    public List<NotificationResponse> getUserNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIds_IdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(notificationMapper::toNotificationResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getAdminNotifications(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository.findAllWithCreatedBy(pageable);
        return notifications.map(notificationMapper::toNotificationResponse);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAdminNotificationsList() {
        List<Notification> notifications = notificationRepository.findAllWithCreatedByList();
        return notifications.stream().map(notificationMapper::toNotificationResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationAdminResponse> getAdminNotificationsWithAdminInfo() {
        List<Notification> notifications = notificationRepository.findAllWithCreatedByList();
        return notifications.stream().map(this::toNotificationAdminResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<NotificationAdminResponse> getAdminNotificationsWithAdminInfo(Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findAllWithCreatedBy(pageable);
        return notifications.map(this::toNotificationAdminResponse);
    }

    private NotificationAdminResponse toNotificationAdminResponse(Notification notification) {
        String createdById = notification.getCreatedBy();
        String createdByUsername = null;

        if (createdById != null && !createdById.isBlank()) {
            var admin = usersRepository.findById(createdById).orElse(null);
            if (admin != null) {
                createdByUsername = admin.getUsername();
            }
        }

        List<NotificationAdminResponse.ReceiverInfo> receivers = notification.getUserIds().stream()
                .filter(Objects::nonNull)
                .map(user -> NotificationAdminResponse.ReceiverInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .build())
                .toList();

        return NotificationAdminResponse.builder()
                .id(notification.getId())
                .content(notification.getContent())
                .link(notification.getLink())
                .createdAt(notification.getCreatedAt())
                .read(notification.isRead())
                .createdById(createdById)
                .createdByUsername(createdByUsername)
                .receivers(receivers)
                .build();
    }

    @Transactional
    public NotificationResponse markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        notification.setRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return notificationMapper.toNotificationResponse(notification);
    }

    @Transactional(readOnly = true)
    public Long getUnread(String userId) {
        Long unreadCount = notificationRepository.countByUserIds_IdAndIsRead(userId, false);
        return unreadCount != null ? unreadCount : 0L;
    }
}
