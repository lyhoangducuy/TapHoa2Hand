package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class PostDetailInfoRequest {
    String description;
    String brand;
    String model;
    String itemCondition;
    String usedDuration;
    String reasonForSelling;
}