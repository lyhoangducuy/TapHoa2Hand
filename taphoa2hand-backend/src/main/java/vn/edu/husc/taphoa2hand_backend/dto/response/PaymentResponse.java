package vn.edu.husc.taphoa2hand_backend.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    String value;   // VD: "DIRECT" (Dùng để lưu DB)
    String label;   // VD: "Trực tiếp" (Dùng để hiện lên UI)
}