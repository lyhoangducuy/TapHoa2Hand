package vn.edu.husc.taphoa2hand_backend.dto.response.Posts;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class PostImageResponse {
    String id;
    String imageUrl;
    Boolean isThumbnail;
    Integer sortOrder;
}
