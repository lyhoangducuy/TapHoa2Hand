package vn.edu.husc.taphoa2hand_backend.dto.response.ChatMessage;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.ParticipantInfo;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ChatMessageResponse {
    String id;
    String conversationId;
    boolean me;
    String message;
    ParticipantInfo sender;
    Instant createdDate;
}
