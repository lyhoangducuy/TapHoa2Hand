package vn.edu.husc.taphoa2hand_backend.dto.response.Statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class RecentActivity {
    String type;
    String description;
    String userId;
    String userName;
    String avatar;
    String targetId;
    String targetTitle;
    String icon;
    String time;
}
