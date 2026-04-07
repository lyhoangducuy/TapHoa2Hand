package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostEditRequest {
    String title;
    Long price;
    String status;
    List<String> retainedImageUrls;
    List<String> listCategoriesId; // Tên danh mục

    // Phương thức thanh toán (chuyển Enum thành String cho FE dễ xài)
    List<String> listAcceptedPaymentMethodsValue;

    // Chi tiết (từ PostDetail)
    PostDetailInfoRequest postDetail;

    // Địa chỉ (từ PostAddress)
    PostAddressRequest postAddress;
}
