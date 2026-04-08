package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String>{
    List<ChatMessage> findAllByConversationIdOrderByCreatedDateDesc(String conversationId);
}