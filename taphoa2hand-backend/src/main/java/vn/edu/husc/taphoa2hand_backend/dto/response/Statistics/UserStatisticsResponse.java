package vn.edu.husc.taphoa2hand_backend.dto.response.Statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserStatisticsResponse {
    String id;
    String fullName;
    String username;
    String email;
    String phone;
    String avatar;
    LocalDate dob;
    LocalDateTime createdAt;
    boolean active;
    Set<String> roles;
    Long totalPosts;
    Long totalOrders;
}
