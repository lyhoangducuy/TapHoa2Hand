package vn.edu.husc.taphoa2hand_backend.dto.response.Banner;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class BannerResponse {
    String id;
    String title;
    String imageDesktop;
    String imageMobile;
    String targetUrl;
    Integer sortOrder;
    Boolean isActive;
    LocalDateTime startDate;
    LocalDateTime endDate;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
