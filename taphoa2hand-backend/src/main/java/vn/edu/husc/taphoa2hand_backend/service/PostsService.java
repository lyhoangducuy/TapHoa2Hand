package vn.edu.husc.taphoa2hand_backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.mapper.PostsMapper;
import vn.edu.husc.taphoa2hand_backend.repository.PostsRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostsService {
    PostsRepository postsRepository;
    PostsMapper postsMapper; // Inject Mapper vào đây
    UsersRepository userRepository; // Inject UserRepository để lấy thông tin người dùng hiện tại
    @Transactional(readOnly = true)
    public List<PostsResponse> getAllPosts() {
        return postsRepository.findAll().stream()
                .map(postsMapper::toPostsResponse)
                .toList();
    }
    public PostsResponse createPost(PostCreateRequest request) {
        System.out.println("===== ENTER CREATE POST SERVICE =====");
        // 1. Map DTO sang Entity (đã bao gồm các đối tượng con)
        Posts post = postsMapper.toPosts(request);

        // 2. Gắn chủ sở hữu (User)
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        post.setUser(user);

        // 3. Set các giá trị mặc định
        post.setViewCount(0L);
        post.setStatus(PostStatusEnum.AVAILABLE); // Dùng Enum của bạn

        // 4. BI-DIRECTIONAL MAPPING (RẤT QUAN TRỌNG ĐỂ CASCADE HOẠT ĐỘNG)
        // Gắn ngược lại post vào các đối tượng con
        if (post.getPostDetail() != null) {
            post.getPostDetail().setPost(post);
        }

        if (post.getPostAddress() != null) {
            post.getPostAddress().setPost(post);
        }

        if (post.getPostImages() != null && !post.getPostImages().isEmpty()) {
            post.getPostImages().forEach(image -> image.setPost(post));
        }

        // SỬA Ở ĐÂY: Tạo biến mới 'savedPost' thay vì ghi đè biến 'post'
        Posts savedPost = postsRepository.save(post);

        // Map biến 'savedPost' này để trả về
        return postsMapper.toPostsResponse(savedPost);
    }
}