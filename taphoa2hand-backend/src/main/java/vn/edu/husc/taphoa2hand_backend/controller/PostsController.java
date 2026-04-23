package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostEditRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDeleteResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDetailResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.service.PostsService;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

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

    @DeleteMapping("/delete/{postId}")
    public ApiResponse<PostDeleteResponse> deletePost(@PathVariable("postId") String postId) {
        return ApiResponse.<PostDeleteResponse>builder()
                .result(postsService.deletePost(postId))
                .build();
    }

    @PutMapping(value = "/edit/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PostDetailResponse> editPost(@PathVariable("postId") String postId,
            @RequestPart("request") PostEditRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        PostDetailResponse newPost = postsService.editPost(postId, request, images);

        return ApiResponse.<PostDetailResponse>builder()
                .result(newPost)
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<Page<PostsResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String categoryId,
            @RequestParam(defaultValue = "0") int page, // Mặc định trang 0 (trang đầu tiên)
            @RequestParam(defaultValue = "10") int size) { // Mặc định 10 bài/trang

        return ApiResponse.<Page<PostsResponse>>builder()
                .message("Tìm kiếm thành công")
                .result(postsService.searchPosts(keyword, location, categoryId, page, size))
                .build();
    }
    @GetMapping("/my-post")
    public ApiResponse<Page<PostsResponse>> myPost(
            @RequestParam(defaultValue = "0") int page, // Mặc định trang 0 (trang đầu tiên)
            @RequestParam(defaultValue = "10") int size){
                return ApiResponse.<Page<PostsResponse>>builder()
                .message("Lay bai viet cua toi thanh cong")
                .result(postsService.myPost(page,size))
                .build();
            }

}
