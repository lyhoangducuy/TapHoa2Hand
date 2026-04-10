package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.WebSocketSession;

@Repository
public interface WebSocketSessionRepository extends JpaRepository<WebSocketSession,String>{
    void deleteBySocketSessionId(String socketSessionId);
    List<WebSocketSession> findByUserIdIn(List<String> userIds);
}
