package vn.edu.husc.taphoa2hand_backend.dto.response.Posts;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.Categories.CategoryResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Categories;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostAddress;
import vn.edu.husc.taphoa2hand_backend.entity.PostImage;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PostDetailResponse {
    String id;
    String title;
    Long price;
    PostStatusEnum status;
    Long viewCount;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    Set<CategoryResponse> categories; // Tên danh mục
    PostTypeResponse postType;
    
    // Phương thức thanh toán (chuyển Enum thành String cho FE dễ xài)
    List<PaymentMethodResponse> acceptedPaymentMethods;
    
    // Ảnh bài đăng
    List<PostImageResponse> postImages;
    
    // Chi tiết (từ PostDetail)
    PostDetailInfoResponse postDetail;
    
    // Địa chỉ (từ PostAddress)
    PostAddressResponse postAddress;
    
    // Người bán (từ Users)
    UsersResponse user;
}