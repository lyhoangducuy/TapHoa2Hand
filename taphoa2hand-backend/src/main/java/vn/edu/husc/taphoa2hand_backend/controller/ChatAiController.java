package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.api.core.ApiAsyncFunction;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.ChatAi.ChatAiRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.AiCheckResponseRecord;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.service.ChatAiService;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @PostMapping("/chat-with-image")
    public ApiResponse<String> chatWithAI(@RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("message") String message) {
        // TODO: process POST request

        return ApiResponse.<String>builder()
                .message("Chat voi anh thanh cong")
                .result(chatAiService.chatWitImage(file, message))
                .build();
    }

    @PostMapping("/check-product/{postId}")
    public ApiResponse<AiCheckResponseRecord> checkProduct(@PathVariable("postId") String postId) {
        return ApiResponse.<AiCheckResponseRecord>builder()
                .message("Tao thanh cong")
                .result(chatAiService.assessPost(postId))
                .build();
    }


}
