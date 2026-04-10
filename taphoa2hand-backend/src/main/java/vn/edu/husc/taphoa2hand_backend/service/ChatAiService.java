package vn.edu.husc.taphoa2hand_backend.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.ChatAi.ChatAiRequest;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ChatAiService {
    ChatClient chatClient;
    public ChatAiService(ChatClient.Builder builder){
        chatClient=builder.build();
    }
    public String chatAi(ChatAiRequest chatAiRequest){
        return chatClient.prompt(chatAiRequest.message()).call().content();
    }
}
