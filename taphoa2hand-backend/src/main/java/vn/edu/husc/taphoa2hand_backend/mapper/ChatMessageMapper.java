package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;

import vn.edu.husc.taphoa2hand_backend.dto.request.ChatMessage.ChatMessageRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ChatMessage.ChatMessageResponse;
import vn.edu.husc.taphoa2hand_backend.entity.ChatMessage;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);
    ChatMessage toChatMessage(ChatMessageRequest chatMessageRequest);
}
