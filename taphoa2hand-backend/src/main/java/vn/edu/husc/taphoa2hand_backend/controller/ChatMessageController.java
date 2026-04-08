package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.ChatMessage.ChatMessageRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.ChatMessage.ChatMessageResponse;
import vn.edu.husc.taphoa2hand_backend.entity.ChatMessage;
import vn.edu.husc.taphoa2hand_backend.service.ChatMessageService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/chat-message")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageController {
    ChatMessageService chatMessageService;
    @PostMapping("/create")
    public ApiResponse<ChatMessageResponse> postMethodName(@RequestBody @Valid ChatMessageRequest request) {
        return ApiResponse.<ChatMessageResponse>builder()
                            .result(chatMessageService.create(request))
                            .build();
    }
    @GetMapping
    public ApiResponse<List<ChatMessageResponse>> getChatMessage(@RequestParam("conversationId") String conversationId){
        return ApiResponse.<List<ChatMessageResponse>>builder()
        .result(chatMessageService.getChatMessage(conversationId))            
        .build();
    }
    
}
