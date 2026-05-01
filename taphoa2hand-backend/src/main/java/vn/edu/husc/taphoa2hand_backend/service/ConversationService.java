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
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.ConversationMapper;
import vn.edu.husc.taphoa2hand_backend.repository.ConversationRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostsRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ConversationService {
    ConversationRepository conversationRepository;
    UsersRepository userRepository;
    ConversationMapper conversationMapper;
    PostsRepository postsRepository;

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
        Posts checkPost=postsRepository.findById(request.getPostId()) 
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        if (checkPost.getStatus() == PostStatusEnum.SOLD) {
            throw new AppException(ErrorCode.POST_ALREADY_SOLD);
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
        
        // FIX 1: Kiểm tra tồn tại trước khi cập nhật để tránh NullPointerException
        if (existConver != null) {
            existConver.setPostId(request.getPostId());
            conversationRepository.save(existConver);
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

        // tao conversation moi
        Conversation newConversation = Conversation.builder()
                .type(request.getType())
                .participantsHash(participantsHash)
                .participants(participantInfos)
                .postId(request.getPostId())
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
        
        // 1. Setup Avatar và Tên (Dựa vào người kia)
        conversationResponse.getParticipants().stream()
                .filter(participant -> !participant.getUsername().equals(currentUserId))
                .findFirst()
                .ifPresent(participant -> {
                    conversationResponse.setConversationAvatar(participant.getAvatar());
                    conversationResponse.setConversationName(participant.getFullName());
                });

        // 2. Setup Thông tin sản phẩm (Chỉ khi đoạn chat có gắn postId)
        if (conversation.getPostId() != null) {
            
            postsRepository.findById(conversation.getPostId()).ifPresent(postCurrent -> {
                // FIX LAZY INITIALIZATION Ở ĐÂY:
                // Ép Hibernate query list ảnh lên ngay lúc này (vì vẫn đang trong @Transactional)
                

                conversationResponse.setPostId(postCurrent.getId());
                conversationResponse.setPostPrice(postCurrent.getPrice());
                conversationResponse.setPostStatus(postCurrent.getStatus().toString());
                
                conversationResponse.setPostTitle(postCurrent.getTitle());    
                var images = postCurrent.getPostImages();
                if (images != null && !images.isEmpty()) {
                    // Chú ý: Đổi .getUrl() hoặc .getPath() cho đúng với tên thuộc tính trong entity PostImages của bạn
                    conversationResponse.setPostImage(images.get(0).getImageUrl()); 
                }   
                if (postCurrent.getUser() != null) {
                    boolean isOwner = postCurrent.getUser().getUsername().equals(currentUserId);
                    conversationResponse.setIsMyPost(isOwner);
                } else {
                    conversationResponse.setIsMyPost(false);
                }
            });
        }

        return conversationResponse;
    }

}
