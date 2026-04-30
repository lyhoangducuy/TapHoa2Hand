package vn.edu.husc.taphoa2hand_backend.dto.request.BannerDTO;

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
public class BannerCreateRequest {
    String title;
    String targetUrl;
    Integer sortOrder;
    Boolean isActive;
    LocalDateTime startDate;
    LocalDateTime endDate;
}