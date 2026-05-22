package vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.ReportStatusEnum;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportFilterRequest {

    String keyword;

    ReportStatusEnum status;

    String type;

    String fromDate;

    String toDate;

    int page = 0;

    int size = 10;

    String sortBy = "createdAt";

    String sortDir = "desc";
}
