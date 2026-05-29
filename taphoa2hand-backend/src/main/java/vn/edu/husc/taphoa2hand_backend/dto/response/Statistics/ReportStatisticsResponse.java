package vn.edu.husc.taphoa2hand_backend.dto.response.Statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ReportStatisticsResponse {
    String id;
    String reason;
    String reasonDisplayName;
    String type;
    String typeDisplayName;
    String status;
    String statusDisplayName;
    String reporterName;
    String reportedUserName;
    String postTitle;
    String orderId;
    String resolutionNote;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
