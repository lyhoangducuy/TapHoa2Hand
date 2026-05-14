package vn.edu.husc.taphoa2hand_backend.dto.response.Report;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.ReportStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.ReportTypeEnum;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportResponse {

    String id;
    String reason;
    ReportTypeEnum type;
    ReportStatusEnum status;

    String reporterId;
    String reporterName;

    String reportedUserId;
    String reportedUserName;

    String orderId;

    String postId;
    String postTitle;

    List<ReportEvidenceResponse> evidences;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}