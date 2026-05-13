package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import vn.edu.husc.taphoa2hand_backend.dto.response.Chat.ConversationResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Conversation;

@Mapper(componentModel = "spring")
public interface ConversationMapper {

    @Mapping(target = "conversationAvatar", ignore = true)
    @Mapping(target = "conversationName", ignore = true)
    @Mapping(target = "postTitle", ignore = true)
    @Mapping(target = "postImage", ignore = true)
    @Mapping(target = "postPrice", ignore = true)
    @Mapping(target = "postType", ignore = true)
    @Mapping(target = "postStatus", ignore = true)
    @Mapping(target = "isMyPost", ignore = true)
    ConversationResponse toConversationResponse(Conversation conversation);
}
