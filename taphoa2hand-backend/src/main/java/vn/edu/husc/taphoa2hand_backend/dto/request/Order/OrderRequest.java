package vn.edu.husc.taphoa2hand_backend.dto.request.Order;

import jakarta.validation.constraints.NotBlank;
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
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class OrderRequest {
    @NotBlank(message="Khong duoc de trong sellerID")
    String sellerId;
    @NotBlank(message="Khong duoc de trong buyerId")
    String buyerId;
    @NotBlank(message="Khong duoc de trong postId")
    String postId;
    @NotBlank(message="Khong duoc de trong method")
    PaymentMethodEnum method;
    
    @NotBlank(message="Khong duoc de trong receiverName")
    String receiverName;
    @NotBlank(message="Khong duoc de trong receiverPhone")
    String receiverPhone;
    @NotBlank(message="Khong duoc de trong shippingAddress")
    String shippingAddress;

    // // Bank người mua (để hoàn tiền)
    // BankInfoDTO buyerBank;

    // // Bank người bán (để nhận tiền)
    // BankInfoDTO sellerBank;

    // @Data
    // public static class BankInfoDTO {
    //     private String bankName;
    //     private String accountName;
    //     private String accountNumber;
    // }
}
