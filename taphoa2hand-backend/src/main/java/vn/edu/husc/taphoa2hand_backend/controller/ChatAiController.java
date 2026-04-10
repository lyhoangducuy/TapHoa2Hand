package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.ChatAi.ChatAiRequest;
import vn.edu.husc.taphoa2hand_backend.service.ChatAiService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/chat-ai")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ChatAiController {
    ChatAiService chatAiService;
    @PostMapping
    public String createChatAi(@RequestBody ChatAiRequest chatAiRequest) {
        return chatAiService.chatAi(chatAiRequest);
    }
    
}
