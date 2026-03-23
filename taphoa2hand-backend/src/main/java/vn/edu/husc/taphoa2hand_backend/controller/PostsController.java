package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.service.PostsService;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;



@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostsController {
    PostsService postsService;

    @GetMapping("/getAll")
    public ApiResponse<List<PostsResponse>> getAllPost() {
        return ApiResponse.<List<PostsResponse>>builder()
            .result(postsService.getAllPosts())
            .build();
    }
    @PostMapping("/create")
    public ApiResponse<PostsResponse> createPost(@RequestBody PostCreateRequest postCreateRequest) {
        System.out.println("===== ENTER CREATE POST CONTROLLER =====");
        return ApiResponse.<PostsResponse>builder()
            .result(postsService.createPost(postCreateRequest))
            .build();
    }
    
    
}
