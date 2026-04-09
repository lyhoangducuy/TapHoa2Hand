package vn.edu.husc.taphoa2hand_backend.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.corundumstudio.socketio.SocketIOServer;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.ChatMessage.ChatMessageRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ChatMessage.ChatMessageResponse;
import vn.edu.husc.taphoa2hand_backend.entity.ChatMessage;
import vn.edu.husc.taphoa2hand_backend.entity.ParticipantInfo;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.ChatMessageMapper;
import vn.edu.husc.taphoa2hand_backend.repository.ChatMessageRepository;
import vn.edu.husc.taphoa2hand_backend.repository.ConversationRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageService {
    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    UsersRepository usersRepository;
    ChatMessageMapper chatMessageMapper;

    SocketIOServer socketIOServer;
    @Transactional
     public List<ChatMessageResponse> getChatMessage(String conversationId) {
        //valid conversation
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream().filter(paticipantInfo -> userName.equals(paticipantInfo.getUsername()))
                .findAny().orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        //
        var chatMessage=chatMessageRepository.findAllByConversationIdOrderByCreatedDateDesc(conversationId);

        return chatMessage.stream().map(this::toChatMessageResponse).toList();
    }
    @Transactional
    public ChatMessageResponse create(ChatMessageRequest request) {
        // Validate conversationId
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream().filter(paticipantInfo -> userName.equals(paticipantInfo.getUsername()))
                .findAny().orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        // Get user info
        var userResponse = usersRepository.findByUsername(userName);

        if (!userResponse.isPresent()) {
            throw new AppException(ErrorCode.UNCAGORIZED_EXCEPTION);
        }

        // Build ChatMessage info
        ChatMessage chatMessage = chatMessageMapper.toChatMessage(request);
        Users userResponseGet = userResponse.get();
        chatMessage.setSender(ParticipantInfo.builder()
                .userId(userResponseGet.getId())
                .username(userName)
                .avatar(userResponseGet.getAvatar())
                .fullName(userResponseGet.getFullName())

                .build());
        // Create chat message
        chatMessage=chatMessageRepository.save(chatMessage);
        //connect socket
        String messaged=chatMessage.getMessage();
        socketIOServer.getAllClients().stream().forEach(client->{
            client.sendEvent("receive_new_message", messaged);
        }
        );
        // convert to response
        return toChatMessageResponse(chatMessage);
    }
    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage){
        String userName=SecurityContextHolder.getContext().getAuthentication().getName();
        var chatMessageResponse=chatMessageMapper.toChatMessageResponse(chatMessage);
        chatMessageResponse.setMe(userName.equals(chatMessageResponse.getSender().getUsername()));
        return chatMessageResponse;
    }
   
}
