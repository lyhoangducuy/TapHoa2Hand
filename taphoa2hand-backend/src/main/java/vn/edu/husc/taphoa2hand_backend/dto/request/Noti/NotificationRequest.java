package vn.edu.husc.taphoa2hand_backend.dto.request.Noti;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationRequest {
    List<String> userIds;
    String content;
    String link;
}