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
import vn.edu.husc.taphoa2hand_backend.entity.ReportTypeEnum;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportCreateRequest {

    @NotBlank(message = "Nội dung báo cáo không được để trống")
    @Size(min = 10, max = 1000, message = "Nội dung phải từ 10 đến 1000 ký tự")
    String reason;

    @NotNull(message = "Loại báo cáo là bắt buộc")
    ReportTypeEnum type;

    String reportedUserId; // Optional, for reporting a user

    String orderId; // Optional, for reporting an order

    @Size(max = 10, message = "Maximum 10 evidence images allowed")
    List<MultipartFile> evidenceImages; // Evidence images to upload
}