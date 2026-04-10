package vn.edu.husc.taphoa2hand_backend.dto.request.Chat;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class ConversationRequest {
    String type;
    @Size(min = 1, message = "A conversation must have at least 1 participant")
    @NotNull(message = "Participants list cannot be null")
    List<String> participantIds; // Danh sách userId của participants
    String postId;
}
