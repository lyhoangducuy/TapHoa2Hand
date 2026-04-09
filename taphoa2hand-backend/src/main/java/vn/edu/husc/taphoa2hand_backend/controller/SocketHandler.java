package vn.edu.husc.taphoa2hand_backend.controller;

import java.text.ParseException;
import java.time.Instant;

import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.nimbusds.jose.JOSEException;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.IntrospectRequest;
import vn.edu.husc.taphoa2hand_backend.entity.WebSocketSession;
import vn.edu.husc.taphoa2hand_backend.service.AuthenticationService;
import vn.edu.husc.taphoa2hand_backend.service.WebSocketSessionService;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SocketHandler {
    SocketIOServer server;
    AuthenticationService authenticationService;
    WebSocketSessionService webSocketSessionService;

    @OnConnect
    public void clientConnected(SocketIOClient client) throws JOSEException, ParseException{
        //get token request param
        String token=client.getHandshakeData().getSingleUrlParam("token");
        //verify token
        var verifyToken=authenticationService.introspect(IntrospectRequest.builder()
            .token(token)
            .tokenType("ACCESS_TOKEN")
            .build());
        //if token is invalid disconect
        if (verifyToken.isValid()){
            log.info("Client connected: "+client.getSessionId() );
            //Persist web socket session
            WebSocketSession webSocketSession=WebSocketSession.builder()
            .socketSessionId(client.getSessionId().toString())
            .userId(verifyToken.getUserId())
            .createdAt(Instant.now())
            .build();
            webSocketSession=webSocketSessionService.create(webSocketSession);
            log.info("Web socket sesssion with id: {}",webSocketSession.getId());
        }else{
              log.info("Authentication fail: "+client.getSessionId() );
              
              client.disconnect();
        }
      
    }

    @OnDisconnect
    public void clientDisconnected(SocketIOClient client) {
        log.info("Client disconnected: " + client.getSessionId());
        webSocketSessionService.deleteSocketSession(client.getSessionId().toString());
    }

    @PostConstruct
    public void startServer() {
        server.start();
        server.addListeners(this);
        log.info("Socket server started");
    }

    @PreDestroy
    public void stopServer() {
        server.stop();
        log.info("Socket server stop");
    }
}
