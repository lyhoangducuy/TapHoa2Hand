package vn.edu.husc.taphoa2hand_backend.dto.response.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class OrderResponse {
     String id;
     String status;
     String paymentMethod;
     String paymentStatus;
     BigDecimal platformFee;
     LocalDateTime createdAt;
    
     String receiverName;
     String receiverPhone;
     String shippingAddress;

     BankInfoResponse buyerBankInfo;
     BankInfoResponse sellerBankInfo;
    
    @Data
    public static class BankInfoResponse {
        private String bankName;
        private String accountName;
        private String accountNumber;
    }
}