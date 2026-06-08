package vn.edu.husc.taphoa2hand_backend.dto.response.Noti;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationAdminResponse {
    String id;
    String content;
    String link;
    LocalDateTime createdAt;
    boolean read;

    String createdById;
    String createdByUsername;

    List<ReceiverInfo> receivers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ReceiverInfo {
        String id;
        String username;
    }
}
