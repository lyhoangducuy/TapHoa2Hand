package vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportUserSubmitRequest {

    @NotBlank(message = "Nội dung báo cáo không được để trống")
    @Size(min = 10, max = 1000, message = "Nội dung phải từ 10 đến 1000 ký tự")
    String reason;

    @NotBlank(message = "Người bị báo cáo là bắt buộc")
    String reportedUserId;

    /** Ảnh minh chứng (tối đa 10), gửi cùng form multipart — tên part: evidenceImages */
    @Size(max = 10, message = "Tối đa 10 ảnh minh chứng")
    List<MultipartFile> evidenceImages;
}
