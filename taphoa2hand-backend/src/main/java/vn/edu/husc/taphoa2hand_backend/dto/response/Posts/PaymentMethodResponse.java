package vn.edu.husc.taphoa2hand_backend.dto.response.Posts;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentMethodResponse {
    String name;        // Ví dụ: "CASH", "BANK_TRANSFER"
    String description; // Ví dụ: "Tiền mặt", "Chuyển khoản ngân hàng"
}