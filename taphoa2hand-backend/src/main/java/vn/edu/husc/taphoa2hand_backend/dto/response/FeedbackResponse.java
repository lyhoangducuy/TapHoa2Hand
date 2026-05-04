package vn.edu.husc.taphoa2hand_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class FeedbackResponse {
    String id;
    String orderId;
    String reviewerId;
    String reviewerName;
    String targetUserId;
    String targetUserName;
    int rating;
    String comment;
    String imageUrl;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
