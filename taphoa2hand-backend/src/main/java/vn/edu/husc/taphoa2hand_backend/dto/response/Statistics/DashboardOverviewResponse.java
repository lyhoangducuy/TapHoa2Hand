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
public class DashboardOverviewResponse {
    Long totalUsers;
    Long totalPosts;
    Long activePosts;
    Long totalOrders;
    Long totalReports;
    Long pendingReports;
    Long newUsersThisMonth;
    Long newPostsThisMonth;
    Long newOrdersThisMonth;
    BigDecimal revenueThisMonth;
}
