package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostStatusResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostTypeResponse;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostType;

@RestController
@RequestMapping("/post-type")
public class PostTypeController {
    @GetMapping("/getAll")
    public ApiResponse<List<PostTypeResponse>> getAllPayments() {
        List<PostTypeResponse> result = Arrays.stream(PostType.values())
                .map(type -> PostTypeResponse.builder()
                        .name(type.name())
                        .displayName(type.getDisplayName())
                        .build())
                .toList();

        return ApiResponse.<List<PostTypeResponse>>builder()
                .message("Lấy danh sách trạng thái bài đăng thành công")
                .result(result)
                .build();
    }
}
