package vn.edu.husc.taphoa2hand_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AverageRatingResponse {
    private Double avgRating;
    private Long totalReviews;
}
