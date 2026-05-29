package vn.edu.husc.taphoa2hand_backend.dto.response.Statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class OrderStatisticsResponse {
    String id;
    String buyerName;
    String sellerName;
    String status;
    String statusDisplayName;
    String paymentMethod;
    BigDecimal totalAmount;
    BigDecimal platformFee;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
