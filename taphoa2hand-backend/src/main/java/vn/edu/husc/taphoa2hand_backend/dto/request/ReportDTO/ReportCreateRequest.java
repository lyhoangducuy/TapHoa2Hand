package vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.ReportReasonEnum;
import vn.edu.husc.taphoa2hand_backend.entity.ReportTypeEnum;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportCreateRequest {

    @NotNull(message = "Lý do báo cáo là bắt buộc")
    ReportReasonEnum reason;

    @NotBlank(message = "Mô tả chi tiết là bắt buộc")
    @Size(min = 20, max = 2000, message = "Mô tả chi tiết phải từ 20 đến 2000 ký tự")
    String detail;
    @NotNull(message = "Loại báo cáo là bắt buộc")
    ReportTypeEnum type;

    String reportedUserId; // Optional, for reporting a user

    String orderId; // Optional, for reporting an order

    String postId; // Optional, for reporting a post

    @Size(max = 10, message = "Maximum 10 evidence images allowed")
    List<MultipartFile> evidenceImages; // Evidence images to upload
}