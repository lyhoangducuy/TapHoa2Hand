package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.WebSocketSession;

@Repository
public interface WebSocketSessionRepository extends JpaRepository<WebSocketSession,String>{
    void deleteBySocketSessionId(String socketSessionId);
}
