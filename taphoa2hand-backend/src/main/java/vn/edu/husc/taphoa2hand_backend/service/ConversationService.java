package vn.edu.husc.taphoa2hand_backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.StringJoiner;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Chat.ConversationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Chat.ConversationResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Conversation;
import vn.edu.husc.taphoa2hand_backend.entity.ParticipantInfo;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.ConversationMapper;
import vn.edu.husc.taphoa2hand_backend.repository.ConversationRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ConversationService {
    ConversationRepository conversationRepository;
    UsersRepository userRepository;
    ConversationMapper conversationMapper;

    @Transactional
    public List<ConversationResponse> myConversations() {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Conversation> conversations = conversationRepository.findMyConversations(userName);
        return conversations.stream().map(this::toConversationResponse).toList();
    }

    @Transactional
    public ConversationResponse createConversation(ConversationRequest request) {
        // lay user hien tai
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByUsername(userName);
        List<Users> participantIds = userRepository.findAllById(request.getParticipantIds());
        if (user == null || participantIds.isEmpty()) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        if (participantIds.contains(user.get())){
            throw new AppException(ErrorCode.THIS_IS_YOU);
        }
        List<String> userIds = new ArrayList<>();
        userIds.add(user.get().getId());
        for (Users participantId : participantIds) {
            if (!userIds.contains(participantId.getId())) {
                userIds.add(participantId.getId());
            }
        }

        var sortedUserIds = userIds.stream().sorted().toList();
        String participantsHash = generateParticipantsHash(sortedUserIds);
        
        
        Conversation existConver = conversationRepository.findByParticipantsHash(participantsHash);
        if (existConver!=null) {
            return toConversationResponse(existConver);
        }
        List<ParticipantInfo> participantInfos = new ArrayList<>();
        participantInfos.add(
                ParticipantInfo.builder()
                        .userId(user.get().getId())
                        .username(user.get().getUsername())
                        .fullName(user.get().getFullName())
                        .avatar(user.get().getAvatar())
                        .build());

        // Thêm các participant khác vào danh sách
        participantIds.forEach(participantId -> {
            participantInfos.add(ParticipantInfo.builder()
                    .userId(participantId.getId())
                    .username(participantId.getUsername())
                    .fullName(participantId.getFullName())
                    .avatar(participantId.getAvatar())
                    .build());
        });

        // toa conversation moi;

        Conversation newConversation = Conversation.builder()
                .type(request.getType())
                .participantsHash(participantsHash)
                .participants(participantInfos)
                .build();
        conversationRepository.save(newConversation);
        return toConversationResponse(newConversation);

    }

    private String generateParticipantsHash(List<String> participantIds) {
        StringJoiner joiner = new StringJoiner(",");
        participantIds.forEach(joiner::add);
        return joiner.toString();
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        ConversationResponse conversationResponse = conversationMapper.toConversationResponse(conversation);
        conversationResponse.getParticipants().stream()
                .filter(participant -> !participant.getUsername().equals(currentUserId))
                .findFirst().ifPresent(participant -> {
                    conversationResponse.setConversationAvatar(participant.getAvatar());
                    conversationResponse.setConversationName(participant.getFullName());
                });
        return conversationResponse;
    }

}
