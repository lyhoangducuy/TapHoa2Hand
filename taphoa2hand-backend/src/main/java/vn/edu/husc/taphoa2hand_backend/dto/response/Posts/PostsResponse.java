package vn.edu.husc.taphoa2hand_backend.dto.response.Posts;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostImage;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostTypeEnum;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PostsResponse {
    String id;
    String title;
    Long price;
    Set<PaymentMethodEnumResponse> acceptedPaymentMethods;
    PostStatusResponse status;
    PostTypeResponse postType;
    Long viewCount;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String userId;
    List<PostImageResponse> postImages;
    String postDetailId;
    String postAddressId;
}
