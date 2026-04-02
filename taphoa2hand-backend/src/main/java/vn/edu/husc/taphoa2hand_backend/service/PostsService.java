package vn.edu.husc.taphoa2hand_backend.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDetailResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostImageResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Categories;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostAddress;
import vn.edu.husc.taphoa2hand_backend.entity.PostDetail;
import vn.edu.husc.taphoa2hand_backend.entity.PostImage;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.CategoriesMapper;
import vn.edu.husc.taphoa2hand_backend.mapper.PostsMapper;
import vn.edu.husc.taphoa2hand_backend.mapper.UserMapper;
import vn.edu.husc.taphoa2hand_backend.repository.CategoryRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostAddressRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostDetailRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostImageRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostsRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostsService {
    PostsRepository postsRepository;
    PostAddressRepository postAddressRepository;
    PostsMapper postsMapper;
    UserMapper userMapper;
    UsersRepository usersRepository;
    CategoriesMapper categoriesMapper;
    PostDetailRepository postDetailRepository;
    CategoryRepository categoryRepository;
    PostImageRepository postImageRepository;

    // Sử dụng FileService mới thay cho FileClient
    FileService fileService;

    @Transactional(readOnly = true)
    public List<PostsResponse> getAllPosts() {
        return postsRepository.findAll().stream()
                .map(postsMapper::toPostsResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PostDetailResponse getDetailPost(String postId) {
        Posts post = postsRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        List<PostImage> postImages = (post.getPostImages() != null) ? post.getPostImages() : List.of();
        List<PostImageResponse> imageResponses = postsMapper.toPostImageResponse(postImages);

        var postDetailResponse = postsMapper.toPostDetailResponse(post);
        postDetailResponse.setPostImages(imageResponses);
        return postDetailResponse;
    }

    @Transactional
    public PostDetailResponse createPost(PostCreateRequest request, List<MultipartFile> images) {
        System.out.println("enter create post service");
        // 1. Lấy thông tin user
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = usersRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Chuyển đổi Request sang Entity
        Posts newPost = postsMapper.toPosts(request);
        newPost.setUser(currentUser);

        if (request.getListAcceptedPaymentMethodsValue() != null && !request.getListAcceptedPaymentMethodsValue().isEmpty()) {
            List<PaymentMethodEnum> paymentEnums = request.getListAcceptedPaymentMethodsValue().stream()
                    .map(PaymentMethodEnum::valueOf) // Ép từ String ("DIRECT") sang kiểu Enum
                    .toList();
            
            newPost.setAcceptedPaymentMethods(paymentEnums); // Nhét vào Entity trước khi lưu
        }

        // BÍ QUYẾT Ở ĐÂY: MapStruct ĐÃ tự tạo sẵn PostDetail và PostAddress bên trong
        // newPost rồi.
        // Chúng ta chỉ cần móc nó ra và set ngược "khóa ngoại" (newPost) vào cho nó là
        // xong.
        if (newPost.getPostDetail() != null) {
            newPost.getPostDetail().setPost(newPost);
        }
        if (newPost.getPostAddress() != null) {
            newPost.getPostAddress().setPost(newPost);
        }

        // 3. Xử lý Categories (Tuyệt đối KHÔNG save categories, chỉ móc từ DB ra và
        // gán)
        Set<Categories> attachedCategories = new HashSet<>();
        for (String categoryId : request.getListCategoriesId()) {
            Categories cat = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            attachedCategories.add(cat);
        }
        newPost.setCategories(attachedCategories);

        // 4. Xử lý Ảnh
        if (images != null && !images.isEmpty()) {
            List<PostImage> postImages = new ArrayList<>();
            int sortOrder = 0;
            for (MultipartFile image : images) {
                try {
                    var imageUrl = fileService.uploadMedia(image);
                    PostImage postImage = new PostImage();
                    postImage.setImageUrl(imageUrl.getUrl());
                    postImage.setIsThumbnail(sortOrder == 0);
                    postImage.setSortOrder(sortOrder++);

                    // Set khóa ngoại
                    postImage.setPost(newPost);
                    postImages.add(postImage);
                } catch (IOException e) {
                    throw new AppException(ErrorCode.FILE_NOT_FOUND);
                }
            }
            newPost.setPostImages(postImages);
        }

        // 5. CHỐT HẠ: Lưu đúng 1 lần duy nhất!
        // Tránh lưu lắt nhắt gây lỗi Update/Delete không đáng có
        Posts savedPost = postsRepository.save(newPost);

        return postsMapper.toPostDetailResponse(savedPost);
    }
}