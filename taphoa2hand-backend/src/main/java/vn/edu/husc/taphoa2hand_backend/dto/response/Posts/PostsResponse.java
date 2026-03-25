package vn.edu.husc.taphoa2hand_backend.dto.response.Posts;

import java.time.LocalDate;
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
    Set<PaymentMethodEnum> acceptedPaymentMethods;
    PostStatusEnum status;
    Long viewCount;
    LocalDate createdAt;
    LocalDate updatedAt;
    String userId;
    List<PostImage> postImages;
    String postDetailId;
    String postAddressId;
}
