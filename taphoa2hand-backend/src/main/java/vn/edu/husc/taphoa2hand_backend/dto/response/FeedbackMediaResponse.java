package vn.edu.husc.taphoa2hand_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackMediaResponse {

    String id;

    String url;

    String type; // IMAGE / VIDEO

    String contentType; // image/png, video/mp4

    long size;
}