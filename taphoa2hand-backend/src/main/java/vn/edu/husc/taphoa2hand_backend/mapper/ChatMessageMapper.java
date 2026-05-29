package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import vn.edu.husc.taphoa2hand_backend.dto.request.ChatMessage.ChatMessageRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ChatMessage.ChatMessageResponse;
import vn.edu.husc.taphoa2hand_backend.entity.ChatMessage;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "mediaUrl", ignore = true)
    @Mapping(target = "mediaType", ignore = true)
    ChatMessage toChatMessage(ChatMessageRequest chatMessageRequest);
}
