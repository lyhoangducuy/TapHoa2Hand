package vn.edu.husc.taphoa2hand_backend.service;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.WebSocketSession;
import vn.edu.husc.taphoa2hand_backend.repository.WebSocketSessionRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class WebSocketSessionService {
    WebSocketSessionRepository webSocketSessionRepository;
    @Transactional
    public WebSocketSession create(WebSocketSession webSocketSession){
        return webSocketSessionRepository.save(webSocketSession);
    }
    @Transactional
    public void deleteSocketSession(String socketSessionId){
        webSocketSessionRepository.deleteBySocketSessionId(socketSessionId);
    }
    public String getUserIdBySocketSessionId(String socketSessionId) {
        return webSocketSessionRepository.findBySocketSessionId(socketSessionId)
                .map(WebSocketSession::getUserId)
                .orElse(null);
    }
}
