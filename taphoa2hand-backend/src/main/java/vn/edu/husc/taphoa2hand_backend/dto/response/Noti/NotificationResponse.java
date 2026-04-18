package vn.edu.husc.taphoa2hand_backend.dto.response.Noti;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String content;
    boolean isRead;
    String link;
}