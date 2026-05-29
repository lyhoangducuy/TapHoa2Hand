package vn.edu.husc.taphoa2hand_backend.dto.response.Statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class StatisticsSummaryResponse {
    BigDecimal totalRevenue;
    Long totalOrders;
    Long escrowOrders;
    Long directOrders;
    Long newUsers;
    Long newPosts;
    Long totalReports;
    Long pendingReports;
    Long refundOrders;
}
