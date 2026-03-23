package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostCreateRequest {
    @NotBlank(message = "TITLE_BLANK")
    String title;
    
    @NotNull(message = "PRICE_NULL")
    Long price;
    
    Set<PaymentMethodEnum> acceptedPaymentMethods;

    // NHỮNG TRƯỜNG MỚI THÊM
    PostDetailRequest postDetail;
    PostAddressRequest postAddress;
    Set<PostImageRequest> postImages;
}