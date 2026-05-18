package vn.edu.husc.taphoa2hand_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackResponse {
    String id;
    String orderId;

    String reviewerId;
    String reviewerName;

    String targetUserId;
    String targetUserName;

    int rating;
    String comment;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    List<FeedbackMediaResponse> mediaList;
}
