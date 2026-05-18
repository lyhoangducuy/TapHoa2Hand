package vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO;

import java.util.List;

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

import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportPostSubmitRequest {

    @NotNull(message = "Lý do báo cáo là bắt buộc")
    ReportReasonEnum reason;

    @NotBlank(message = "Nội dung báo cáo là bắt buộc")
    @Size(min = 20, max = 2000)
    String detail;

    @NotBlank(message = "Bài đăng là bắt buộc")
    String postId;

    @Size(max = 10, message = "Tối đa 10 ảnh minh chứng")
    List<MultipartFile> evidenceImages;
}
