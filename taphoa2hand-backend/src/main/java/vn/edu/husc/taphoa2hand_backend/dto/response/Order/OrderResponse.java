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
     /** Phí nền tảng (trung gian), tính theo tỷ lệ cố định trên giá hàng. */
     BigDecimal platformFee;
     LocalDateTime createdAt;

     String receiverName;
     String receiverPhone;
     String shippingAddress;

     BankInfoResponse buyerBankInfo;
     BankInfoResponse sellerBankInfo;

    /** Tin đăng (mục đầu tiên trong đơn) — phục vụ nhóm đơn theo bài viết */
    String postId;
    String postTitle;
    String postImageUrl;
     /** Người mua (username) — người bán xem khi có nhiều yêu cầu */
     String buyerUsername;

    /** Hết hạn giữ tiền ký quỹ (trung gian, sau DELIVERED). */
    LocalDateTime holdUntil;
    String holdDurationUnit;
    Integer holdDurationAmount;

    //  BankInfoResponse buyerBankInfo;
    //  BankInfoResponse sellerBankInfo;
}