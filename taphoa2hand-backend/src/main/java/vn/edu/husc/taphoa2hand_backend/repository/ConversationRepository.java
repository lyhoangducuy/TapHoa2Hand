package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import feign.Param;
import vn.edu.husc.taphoa2hand_backend.entity.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    public Conversation findByParticipantsHash(String participantsHash);
    // Thêm chữ FETCH vào sau chữ JOIN
    @Query("SELECT c FROM Conversation c WHERE EXISTS (SELECT 1 FROM c.participants p WHERE p.username = :username)")
    List<Conversation> findMyConversations(@Param("username") String username);
}