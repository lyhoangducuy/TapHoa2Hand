package vn.edu.husc.taphoa2hand_backend.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;
import vn.edu.husc.taphoa2hand_backend.entity.FeedbackMedia;

@Data
@Builder
public class FeedbackFullResponse {
    private String id;
    private int rating;
    private String comment;

    private String orderId;

    private String postId;
    private String postTitle;
    private String postImage;

    private String reviewerId;
    private String reviewerName;

    private String targetUserId;
    private String targetUserName;

    private String createdAt;

    private List<FeedbackMediaResponse> mediaList;
}