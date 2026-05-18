package vn.edu.husc.taphoa2hand_backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackMediaResponse;
import vn.edu.husc.taphoa2hand_backend.entity.FeedbackMedia;

@Mapper(componentModel = "spring")
public interface FeedbackMediaMapper {

    FeedbackMediaResponse toResponse(FeedbackMedia media);

    List<FeedbackMediaResponse> toResponseList(List<FeedbackMedia> list);
}