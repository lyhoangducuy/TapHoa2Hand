package vn.edu.husc.taphoa2hand_backend.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.Favorites.FavoritesGetByIdResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Favorites.FavoritesResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Favorites;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.PostsMapper;
import vn.edu.husc.taphoa2hand_backend.repository.FavoritesRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostsRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FavoritesService {
    FavoritesRepository favoritesRepository;
    UsersRepository usersRepository;
    PostsRepository postRepository;
    PostsMapper postsMapper;

    public FavoritesResponse addToFavorites(String productId) {
        var user = SecurityContextHolder.getContext().getAuthentication();
        var existingUser = usersRepository.findByUsername(user.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Favorites favorite = Favorites.builder()
                .userId(existingUser.getId())
                .productId(productId)
                .build();
        favoritesRepository.save(favorite);
        return FavoritesResponse.builder()
                .success(true)
                .build();
    }

    public FavoritesResponse removeFromFavorites(String productId) {
        var user = SecurityContextHolder.getContext().getAuthentication();
        var existingUser = usersRepository.findByUsername(user.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var favorite = favoritesRepository.findByUserIdAndProductId(existingUser.getId(), productId)
                .orElseThrow(() -> new AppException(ErrorCode.FAVORITE_NOT_FOUND));
        favoritesRepository.delete(favorite);
        return FavoritesResponse.builder()
                .success(true)
                .build();
    }

    @Transactional(readOnly = true)
    public List<PostsResponse> getMyFavorites() {
        var user = SecurityContextHolder.getContext().getAuthentication();
        var existingUser = usersRepository.findByUsername(user.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Favorites> favorites = favoritesRepository.findListByUserId(existingUser.getId());

        List<Posts> pList= postRepository.findAllById(favorites.stream()
                .map(Favorites::getProductId)
                .toList());
        List<PostsResponse> posts = pList.stream()
                .map(postsMapper::toPostsResponse)
                .toList();

        return posts;
    }

    public FavoritesResponse checkFavorite(String productId) {
        var user = SecurityContextHolder.getContext().getAuthentication();
        var existingUser = usersRepository.findByUsername(user.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var favorite = favoritesRepository.findByUserIdAndProductId(existingUser.getId(), productId);
        return FavoritesResponse.builder()
                .success(favorite.isPresent())
                .build();
    }
}
