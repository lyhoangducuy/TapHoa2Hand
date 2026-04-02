package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

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
    String title;
    Long price;

    List<String> listCategoriesId; // Tên danh mục
    
    // Phương thức thanh toán (chuyển Enum thành String cho FE dễ xài)
    List<String> listAcceptedPaymentMethodsValue;
    
    
    // Chi tiết (từ PostDetail)
    PostDetailInfoRequest postDetail;
    
    // Địa chỉ (từ PostAddress)
    PostAddressRequest postAddress;
}