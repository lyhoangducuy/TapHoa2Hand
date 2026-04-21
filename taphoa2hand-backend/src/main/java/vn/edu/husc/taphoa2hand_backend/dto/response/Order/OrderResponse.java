package vn.edu.husc.taphoa2hand_backend.dto.response.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.OrderStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentStatusEnum;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class OrderResponse {
     String id;
     String buyserId;
     String sellerId;
     OrderStatusEnum status;
     PaymentMethodEnum paymentMethod;
     PaymentStatusEnum paymentStatus;
     BigDecimal totalAmount;
     LocalDateTime createdAt;

     String receiverName;
     String receiverPhone;
     String shippingAddress;

    //  BankInfoResponse buyerBankInfo;
    //  BankInfoResponse sellerBankInfo;
    
    // @Data
    // public static class BankInfoResponse {
    //     private String bankName;
    //     private String accountName;
    //     private String accountNumber;
    // }
}