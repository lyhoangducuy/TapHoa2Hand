package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;

import vn.edu.husc.taphoa2hand_backend.dto.response.Chat.ConversationResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Conversation;
@Mapper(componentModel = "spring")
public interface ConversationMapper {
    ConversationResponse toConversationResponse(Conversation conversation);
}
