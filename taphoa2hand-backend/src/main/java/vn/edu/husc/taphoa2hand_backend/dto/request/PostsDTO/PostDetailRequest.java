package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostDetailRequest {
    String description;
    String brand;
    String model;
    String condition;
    String usedDuration;
    String reasonForSelling;
}