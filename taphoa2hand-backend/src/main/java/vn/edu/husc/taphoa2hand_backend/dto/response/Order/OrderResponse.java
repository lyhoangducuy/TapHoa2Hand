package vn.edu.husc.taphoa2hand_backend.dto.response.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PaymentMethodEnumResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.BankInfoResponse;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class OrderResponse {
     String id;
     String buyerId;
     String sellerId;
     OrderStatusEnumResponse status;
     PaymentMethodEnumResponse paymentMethod;
     PaymentStatusEnumResponse paymentStatus;
     BigDecimal totalAmount;
     LocalDateTime createdAt;

     String receiverName;
     String receiverPhone;
     String shippingAddress;

     BankInfoResponse buyerBankInfo;
     BankInfoResponse sellerBankInfo;

    //  BankInfoResponse buyerBankInfo;
    //  BankInfoResponse sellerBankInfo;
}