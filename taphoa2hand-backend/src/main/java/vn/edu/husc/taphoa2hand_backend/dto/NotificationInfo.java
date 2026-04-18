package vn.edu.husc.taphoa2hand_backend.dto;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class NotificationInfo {
    String id;
    
    String content; // Nội dung (VD: "Ai đó đã like bài viết của bạn")
    String link; // Link để click vào thông báo (nếu cần)
    String userId;
    boolean isRead = false;
    LocalDateTime createdAt = LocalDateTime.now();
}
