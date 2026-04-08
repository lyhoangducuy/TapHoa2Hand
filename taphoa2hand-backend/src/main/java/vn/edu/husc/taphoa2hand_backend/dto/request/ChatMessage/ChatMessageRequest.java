package vn.edu.husc.taphoa2hand_backend.dto.request.ChatMessage;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ChatMessageRequest {
    @NotBlank
    String conversationId;
    @NotBlank
    String message;
}
