package vn.edu.husc.taphoa2hand_backend.dto.response.Posts;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class PostDetailInfoResponse {
    String description;
    String brand;
    String model;
    String itemCondition;
    String usedDuration;
    String reasonForSelling;
}