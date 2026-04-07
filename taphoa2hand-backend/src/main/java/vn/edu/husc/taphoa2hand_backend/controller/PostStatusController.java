package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostStatusResponse;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;

@RestController
@RequestMapping("/post-status")
public class PostStatusController {
    @GetMapping("/getAll")
    public ApiResponse<List<PostStatusResponse>> getAllPayments() {
        List<PostStatusResponse> result = Arrays.stream(PostStatusEnum.values())
                .map(status -> PostStatusResponse.builder()
                        .code(status.name())
                        .displayName(status.getDisplayName())
                        .build())
                .toList();

        return ApiResponse.<List<PostStatusResponse>>builder()
                .message("Lấy danh sách trạng thái bài đăng thành công")
                .result(result)
                .build();
    }
}
