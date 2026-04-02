package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentMethodRequest {
    String value;        // Ví dụ: "CASH", "BANK_TRANSFER"
    String label; // Ví dụ: "Tiền mặt", "Chuyển khoản ngân hàng"
}