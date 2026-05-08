package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostAddressRequest {
    @NotBlank(message = "Tỉnh / Thành phố không được để trống")
    @Size(min = 2, max = 100, message = "Tỉnh / Thành phố phải có độ dài từ 2 đến 100 ký tự")
    String city;
    
    @NotBlank(message = "Quận / Huyện / Phường / Xã không được để trống")
    @Size(min = 2, max = 100, message = "Quận / Huyện / Phường / Xã phải có độ dài từ 2 đến 100 ký tự")
    String ward;
    
    @NotBlank(message = "Số nhà / Tên đường không được để trống")
    @Size(min = 2, max = 200, message = "Số nhà / Tên đường phải có độ dài từ 2 đến 200 ký tự")
    String street;
}