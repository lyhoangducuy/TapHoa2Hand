package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Favorites.FavoritesGetByIdResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Favorites.FavoritesResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.service.FavoritesService;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;




@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FavoritesController {
    private FavoritesService favoritesService;
    @PostMapping("/add/{postId}")
    public ApiResponse<FavoritesResponse> addToFavorites(@PathVariable("postId") String productId){
        var response = favoritesService.addToFavorites(productId);
        return ApiResponse.<FavoritesResponse>builder()
                .result(response)
                .build();
    }
    @DeleteMapping("/remove/{postId}")
    public ApiResponse<FavoritesResponse> removeFromFavorites(@PathVariable("postId") String productId){
        var response = favoritesService.removeFromFavorites(productId);
        return ApiResponse.<FavoritesResponse>builder()
                .result(response)
                .build();
    }
    @GetMapping("/my-favorites")
    public ApiResponse<List<PostsResponse>> getMyFavorites(){
        var response = favoritesService.getMyFavorites();
        return ApiResponse.<List<PostsResponse>>builder()
                .result(response)
                .build();
    }
    @GetMapping("/check/{postId}")
    public ApiResponse<FavoritesResponse> checkFavorite(@PathVariable("postId") String productId){
        var response = favoritesService.checkFavorite(productId);
        return ApiResponse.<FavoritesResponse>builder()
                .result(response)
                .build();
    }
    
    
}
