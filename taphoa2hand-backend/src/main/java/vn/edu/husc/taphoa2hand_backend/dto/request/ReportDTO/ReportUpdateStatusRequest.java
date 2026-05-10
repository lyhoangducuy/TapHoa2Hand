package vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.ReportStatusEnum;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportUpdateStatusRequest {

    @NotNull(message = "Trạng thái là bắt buộc")
    ReportStatusEnum status;
}