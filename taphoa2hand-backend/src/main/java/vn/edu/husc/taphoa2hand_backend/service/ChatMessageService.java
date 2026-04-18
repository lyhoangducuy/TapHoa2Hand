package vn.edu.husc.taphoa2hand_backend.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.ChatMessage.ChatMessageRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ChatMessage.ChatMessageResponse;
import vn.edu.husc.taphoa2hand_backend.entity.ChatMessage;
import vn.edu.husc.taphoa2hand_backend.entity.ParticipantInfo;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.entity.WebSocketSession;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.ChatMessageMapper;
import vn.edu.husc.taphoa2hand_backend.repository.ChatMessageRepository;
import vn.edu.husc.taphoa2hand_backend.repository.ConversationRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;
import vn.edu.husc.taphoa2hand_backend.repository.WebSocketSessionRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageService {
    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    UsersRepository usersRepository;
    ChatMessageMapper chatMessageMapper;
    WebSocketSessionRepository webSocketSessionRepository;
    ObjectMapper objectMapper;

    SocketIOServer socketIOServer;

    @Transactional
    public List<ChatMessageResponse> getChatMessage(String conversationId) {
        // valid conversation
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream().filter(paticipantInfo -> userName.equals(paticipantInfo.getUsername()))
                .findAny().orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        //
        var chatMessage = chatMessageRepository.findAllByConversationIdOrderByCreatedDateDesc(conversationId);

        return chatMessage.stream().map(this::toChatMessageResponse).toList();
    }

    @Transactional
    public ChatMessageResponse create(ChatMessageRequest request) {
        // Validate conversationId
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        var conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        conversation.getParticipants()
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
        chatMessage = chatMessageRepository.save(chatMessage);
        // connect socket

        ChatMessageResponse chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);
        // publish socket to client in conversation
        // get participants userIds
        List<String> userIds = conversation.getParticipants()
                .stream()
                .map(ParticipantInfo::getUsername).toList();
        Map<String, WebSocketSession> webSocketSessions = webSocketSessionRepository.findByUserIdIn(userIds)
                .stream()
                .collect(Collectors.toMap(
                        WebSocketSession::getSocketSessionId, Function.identity()));
        socketIOServer.getAllClients().stream().forEach(client -> {
            var webSocketSession = webSocketSessions.get(client.getSessionId().toString());
            if (Objects.nonNull(webSocketSession)) {
                String messaged = null;
                try {
                    chatMessageResponse.setMe(webSocketSession.getUserId().equals(userResponseGet.getId()));
                    messaged = objectMapper.writeValueAsString(chatMessageResponse);
                    client.sendEvent("receive_new_message", messaged);

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });// Lấy danh sách session từ DB
        Map<String, WebSocketSession> webSocketSessions1 = webSocketSessionRepository.findByUserIdIn(userIds)
                .stream()
                .collect(Collectors.toMap(
                        WebSocketSession::getSocketSessionId, Function.identity()));

        System.out.println(">>> SỐ LƯỢNG SESSION TÌM THẤY TRONG DB: " + webSocketSessions1.size());

        socketIOServer.getAllClients().stream().forEach(client -> {
            String sessionId = client.getSessionId().toString();
            System.out.println(">>> ĐANG KIỂM TRA CLIENT CÓ ID LÀ: " + sessionId);

            var webSocketSession = webSocketSessions1.get(sessionId);
            System.out.println(">>> MATCH VỚI DB KHÔNG? " + (webSocketSession != null));

            if (Objects.nonNull(webSocketSession)) {
                String messaged = null;
                try {
                    chatMessageResponse.setMe(webSocketSession.getUserId()
                            .equals(userResponseGet.getUsername()));
                    messaged = objectMapper.writeValueAsString(chatMessageResponse);
                    client.sendEvent("receive_new_message", messaged);
                    System.out.println(">>> ĐÃ GỬI THÀNH CÔNG CHO: " + sessionId);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
        // convert to response
        return toChatMessageResponse(chatMessage);
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        var chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);
        chatMessageResponse.setMe(userName.equals(chatMessageResponse.getSender().getUsername()));
        return chatMessageResponse;
    }

}
