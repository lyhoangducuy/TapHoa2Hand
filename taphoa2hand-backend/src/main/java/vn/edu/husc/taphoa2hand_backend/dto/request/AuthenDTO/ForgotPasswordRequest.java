package vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ForgotPasswordRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;
}
