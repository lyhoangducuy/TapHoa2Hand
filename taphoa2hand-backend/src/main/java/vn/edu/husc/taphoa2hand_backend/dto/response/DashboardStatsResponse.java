package vn.edu.husc.taphoa2hand_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class DashboardStatsResponse {
    Long totalUsers;
    Long totalPosts;
    Long totalOrders;
    Long totalCategories;
    Long totalFeedbacks;
    Long totalBanners;
}
