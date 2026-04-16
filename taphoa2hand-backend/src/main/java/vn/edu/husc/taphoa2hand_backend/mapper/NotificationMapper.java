package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;

import vn.edu.husc.taphoa2hand_backend.dto.response.Noti.NotificationResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toNotificationResponse(Notification notification);
}
