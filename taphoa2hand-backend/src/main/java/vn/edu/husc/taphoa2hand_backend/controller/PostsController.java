package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDetailResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.service.PostsService;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

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

    @GetMapping("/{postId}")
    public ApiResponse<PostDetailResponse> getPostDetail(@PathVariable("postId") String postId) {
        return ApiResponse.<PostDetailResponse>builder()
                .result(postsService.getDetailPost(postId))
                .build();
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PostDetailResponse> createPost(
            @RequestPart("request") PostCreateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        PostDetailResponse newPost = postsService.createPost(request, images);

        return ApiResponse.<PostDetailResponse>builder()
                .result(newPost)
                .build();
    }

}
