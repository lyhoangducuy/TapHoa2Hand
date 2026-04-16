package vn.edu.husc.taphoa2hand_backend.entity;



import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String recipientId; // ID của người nhận thông báo
    String content; // Nội dung (VD: "Ai đó đã like bài viết của bạn")
    String link; // Link để click vào thông báo (nếu cần)
    @Builder.Default
    boolean isRead = false; // Mặc định là chưa đọc

    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
}
