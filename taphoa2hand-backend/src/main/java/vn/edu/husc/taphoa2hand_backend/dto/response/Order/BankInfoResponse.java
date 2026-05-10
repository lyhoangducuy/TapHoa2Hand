package vn.edu.husc.taphoa2hand_backend.dto.response.Order;

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
public class BankInfoResponse {
    String id;
    String bankName;
    String accountName;
    String accountNumber;
}
