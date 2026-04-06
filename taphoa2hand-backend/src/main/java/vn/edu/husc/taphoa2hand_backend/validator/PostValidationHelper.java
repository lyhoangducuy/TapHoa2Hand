package vn.edu.husc.taphoa2hand_backend.validator;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.repository.PostsRepository;

@Component("postValidationHelper") // Đánh dấu đây là 1 Spring Bean với tên cụ thể
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostValidationHelper {
    private PostsRepository postsRepository;

    public boolean canEditPost(String postId) {
        var post = postsRepository.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        var user = SecurityContextHolder.getContext().getAuthentication();
        if (!post.getUser().getUsername().equals(user.getName())) {
            throw new AppException(ErrorCode.POST_CANNOT_DELETE);
        }
        return true;
    }
}
