package vn.edu.husc.taphoa2hand_backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostEditRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDeleteResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDetailResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.service.PostsService;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/admin/posts")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminPostsController {
    PostsService postsService;

    @GetMapping
    public ApiResponse<Page<PostsResponse> > getPosts(@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable) {
        return ApiResponse.<Page<PostsResponse> >builder()
                .message("Lay toan bo bai dang thanh cong")
                .result(postsService.getAllPostsAdmin(pageable))
                .build();
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostDetailResponse> getPostDetail(@PathVariable("postId") String postId) {
        return ApiResponse.<PostDetailResponse>builder()
                .message("Lay chi tiet, bai dang thanh cong")
                .result(postsService.getDetailPost(postId))
                .build();
    }

    @PutMapping(value = "/{postId}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PostDetailResponse> updatePost(@PathVariable("postId") String postId,
            @RequestPart("request") PostEditRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        return ApiResponse.<PostDetailResponse>builder()
                .message("Cap nhat bai dang thanh cong")
                .result(postsService.editPost(postId, request, images))
                .build();
    }

    @DeleteMapping("/{postId}/delete")
    public ApiResponse<PostDeleteResponse> deletePost(@PathVariable("postId") String postId) {
        return ApiResponse.<PostDeleteResponse>builder()
                .result(postsService.deletePost(postId))
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
