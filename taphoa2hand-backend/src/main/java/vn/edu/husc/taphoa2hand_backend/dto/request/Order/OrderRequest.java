package vn.edu.husc.taphoa2hand_backend.dto.request.Order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.validator.MiddlemanBankInfoConstraint;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@MiddlemanBankInfoConstraint
public class OrderRequest {
    @NotBlank(message="Khong duoc de trong sellerID")
    String sellerId;
    String buyerId;
    @NotBlank(message="Khong duoc de trong postId")
    String postId;
    @NotNull(message = "Phương thức thanh toán không được để trống")
    String method;
    
    @NotBlank(message="Khong duoc de trong receiverName")
    String receiverName;
    @NotBlank(message="Khong duoc de trong receiverPhone")
    String receiverPhone;
    @NotBlank(message="Khong duoc de trong shippingAddress")
    String shippingAddress;

    /** Giao dịch trung gian: HOURS hoặc DAYS — thời gian giữ tiền hai bên sau khi giao thành công. */
    String holdDurationUnit;
    /** Số giờ hoặc số ngày tương ứng; tối đa 10 ngày (240 giờ). */
    Integer holdDurationAmount;

    // Bank người mua (để hoàn tiền nếu cần)
    @Valid
    BankInfoDTO buyerBank;

    // Bank người bán (để giải ngân khi giao dịch trung gian)
    @Valid
    BankInfoDTO sellerBank;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class BankInfoDTO {
        @NotBlank(message = "Tên ngân hàng không được để trống")
        String bankName;

        @NotBlank(message = "Tên chủ tài khoản không được để trống")
        String accountName;

        @NotBlank(message = "Số tài khoản không được để trống")
        String accountNumber;
    }
}
