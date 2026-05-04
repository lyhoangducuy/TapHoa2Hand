package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.edu.husc.taphoa2hand_backend.dto.request.FeedbackDTO;
import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Feedback;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface FeedbackMapper {

    @Mapping(source = "reviewer.id", target = "reviewerId")
    @Mapping(source = "reviewer.fullName", target = "reviewerName")
    @Mapping(source = "targetUser.id", target = "targetUserId")
    @Mapping(source = "targetUser.fullName", target = "targetUserName")
    @Mapping(source = "order.id", target = "orderId")
    FeedbackResponse toResponse(Feedback feedback);
    
    List<FeedbackResponse> toResponseList(List<Feedback> feedbacks);
}
