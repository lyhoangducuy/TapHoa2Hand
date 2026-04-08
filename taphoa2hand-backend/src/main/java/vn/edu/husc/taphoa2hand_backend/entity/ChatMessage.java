package vn.edu.husc.taphoa2hand_backend.entity;

import java.time.Instant;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "chat_message", indexes = {
    // Composite Index: Giúp load tin nhắn theo cuộc hội thoại và sắp xếp thời gian cực nhanh
    @Index(name = "idx_conversation_date", columnList = "conversationId, createdDate DESC"),
    
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "conversation_id", nullable = false)
    String conversationId;

    @Column(columnDefinition = "TEXT") // Cho phép tin nhắn dài, không bị giới hạn 255 ký tự
    String message;

    /**
     * Lưu ParticipantInfo dưới dạng JSON. 
     * Giúp lấy tin nhắn kèm luôn Avatar/Name của người gửi mà không cần Join bảng Users.
     */
    ParticipantInfo sender;

    @Builder.Default
    @Column(name = "created_date")
    Instant createdDate = Instant.now();
}