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
public class OrderPostResponse {
    String orderId;
    String username;
    String avatar;
    LocalDateTime createdAt;
    BigDecimal price;
}
