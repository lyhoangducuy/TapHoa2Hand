package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class PostCreateRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(min = 5, max = 200, message = "Tiêu đề phải có độ dài từ 5 đến 200 ký tự")
    String title;
    
    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0", inclusive = false, message = "Giá phải lớn hơn 0")
    Long price;

    @NotEmpty(message = "Phải chọn ít nhất 1 danh mục")
    @Size(min = 1, message = "Phải chọn ít nhất 1 danh mục")
    List<String> listCategoriesId; // Tên danh mục
    
    @NotEmpty(message = "Phải chọn ít nhất 1 phương thức thanh toán")
    @Size(min = 1, message = "Phải chọn ít nhất 1 phương thức thanh toán")
    List<String> listAcceptedPaymentMethodsValue; // Phương thức thanh toán (chuyển Enum thành String cho FE dễ xài)
    
    @NotBlank(message = "Loại tin không được để trống")
    String postTypeName; // Name của PostType (SELL, BUY, etc.)
    
    // Chi tiết (từ PostDetail)
    @Valid
    PostDetailInfoRequest postDetail;
    
    // Địa chỉ (từ PostAddress)
    @Valid
    PostAddressRequest postAddress;
}