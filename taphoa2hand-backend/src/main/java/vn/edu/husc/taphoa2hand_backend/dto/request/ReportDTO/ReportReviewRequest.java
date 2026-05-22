package vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.PenaltyActionEnum;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportReviewRequest {

    @NotNull(message = "Trạng thái là bắt buộc")
    String status;

    String resolutionNote;

    List<PenaltyActionEnum> penalties;
}
