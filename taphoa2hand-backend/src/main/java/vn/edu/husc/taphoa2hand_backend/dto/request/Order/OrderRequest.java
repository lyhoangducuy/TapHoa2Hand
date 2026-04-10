package vn.edu.husc.taphoa2hand_backend.dto.request.Order;

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
    String sellerId;
    String postId;
    PaymentMethodEnum method;
    
    String receiverName;
    String receiverPhone;
    String shippingAddress;

    // Bank người mua (để hoàn tiền)
    BankInfoDTO buyerBank;

    // Bank người bán (để nhận tiền)
    BankInfoDTO sellerBank;

    @Data
    public static class BankInfoDTO {
        private String bankName;
        private String accountName;
        private String accountNumber;
    }
}
