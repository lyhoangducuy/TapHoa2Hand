package vn.edu.husc.taphoa2hand_backend.dto.response.Report;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.PenaltyActionEnum;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportPenaltyResponse {

    String id;
    PenaltyActionEnum action;
    String note;
    LocalDateTime createdAt;
}
