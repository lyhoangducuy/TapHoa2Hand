package vn.edu.husc.taphoa2hand_backend.dto.response.Noti;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String recipientId;
    String content;
    boolean isRead;
    String link;
    LocalDateTime createdAt;
}