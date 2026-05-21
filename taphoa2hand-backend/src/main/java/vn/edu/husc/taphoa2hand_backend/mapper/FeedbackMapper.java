package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Feedback;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class, FeedbackMediaMapper.class})
public interface FeedbackMapper {

    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "reviewer.id", target = "reviewerId")
    @Mapping(source = "targetUser.id", target = "targetUserId")
    @Mapping(source = "mediaList", target = "mediaList")
    FeedbackResponse toResponse(Feedback feedback);

    List<FeedbackResponse> toResponseList(List<Feedback> feedbacks);

    @AfterMapping
    default void fillUserNames(Feedback source, @MappingTarget FeedbackResponse target) {
        if (source.getReviewer() != null) {
            target.setReviewerName(source.getReviewer().getUsername());
        }
        if (source.getTargetUser() != null) {
            target.setTargetUserName(source.getTargetUser().getUsername());
        }
    }
}
