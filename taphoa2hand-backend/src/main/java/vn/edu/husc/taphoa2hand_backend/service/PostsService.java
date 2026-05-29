package vn.edu.husc.taphoa2hand_backend.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.angus.mail.handlers.handler_base;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostEditRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderOfPostResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDeleteResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDetailResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostImageResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Categories;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostAddress;
import vn.edu.husc.taphoa2hand_backend.entity.PostDetail;
import vn.edu.husc.taphoa2hand_backend.entity.PostImage;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostTypeEnum;
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
    OrderService orderService;
    SearchHistoryService searchHistoryService;
    // Sử dụng FileService mới thay cho FileClient
    FileService fileService;

    @Transactional
    public Page<PostsResponse> searchPosts(
            String keyword,
            String location,
            String categoryId,
            String postType,
            Long minPrice,
            Long maxPrice,
            String dateFrom,
            String dateTo,
            String sortBy,
            int page,
            int size) {

        // =========================
        // SAVE SEARCH HISTORY
        // =========================
        try {
            var context = SecurityContextHolder.getContext();
            String username = context.getAuthentication().getName();
            Users user = usersRepository.findByUsername(username).orElseThrow(
                    () -> new AppException(ErrorCode.USER_NOT_FOUND));

            searchHistoryService.saveSearchHistory(
                    user,
                    keyword,
                    location,
                    categoryId,
                    postType,
                    minPrice != null ? minPrice.toString() : null,
                    maxPrice != null ? maxPrice.toString() : null,
                    sortBy,
                    dateFrom,
                    dateTo);

        } catch (Exception e) {
            System.out.println("Không thể lưu search history: " + e.getMessage());
        }

        // =========================
        // CREATE SORT
        // =========================
        Sort sort = Sort.by("createdAt").descending();

        if (sortBy != null && !sortBy.trim().isEmpty()) {

            switch (sortBy) {

                case "price_asc":
                    sort = Sort.by("price").ascending();
                    break;

                case "price_desc":
                    sort = Sort.by("price").descending();
                    break;

                default:
                    sort = Sort.by("createdAt").descending();
                    break;
            }
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        // =========================
        // DEBUG LOG
        // =========================
        System.out.println("SearchPosts called with:");
        System.out.println("keyword: " + keyword);
        System.out.println("location: " + location);
        System.out.println("categoryId: " + categoryId);
        System.out.println("postType: " + postType);
        System.out.println("minPrice: " + minPrice);
        System.out.println("maxPrice: " + maxPrice);
        System.out.println("dateFrom: " + dateFrom);
        System.out.println("dateTo: " + dateTo);
        System.out.println("sortBy: " + sortBy);
        System.out.println("page: " + page + ", size: " + size);

        // =========================
        // CONVERT POST TYPE
        // =========================
        PostTypeEnum postTypeEnum = null;

        if (postType != null && !postType.trim().isEmpty()) {

            try {

                postTypeEnum = PostTypeEnum.valueOf(
                        postType.toUpperCase());

            } catch (IllegalArgumentException e) {

                System.out.println(
                        "Invalid postType: " + postType);
            }
        }

        // =========================
        // STATUS FILTER
        // =========================
        List<PostStatusEnum> statusFilters;

        if (postTypeEnum == PostTypeEnum.SELL) {

            statusFilters = List.of(
                    PostStatusEnum.AVAILABLE);

        } else if (postTypeEnum == PostTypeEnum.BUY) {

            statusFilters = List.of(
                    PostStatusEnum.SEARCHING,
                    PostStatusEnum.AVAILABLE);

        } else {

            statusFilters = List.of(
                    PostStatusEnum.AVAILABLE,
                    PostStatusEnum.SEARCHING);
        }

        // =========================
        // SEARCH POSTS
        // =========================
        Page<Posts> postsPage = postsRepository.searchPosts(
                keyword,
                location,
                categoryId,
                postTypeEnum,
                statusFilters,
                minPrice,
                maxPrice,
                dateFrom,
                dateTo,
                pageable);
        System.out.println(
                "Found "
                        + postsPage.getTotalElements()
                        + " posts");

        return postsPage.map(
                postsMapper::toPostsResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostsResponse> getSellingPosts(int page, int size) {
        return searchPosts(null, null, null, PostTypeEnum.SELL.name(), null, null, null, null, null, page, size);
    }

    @Transactional(readOnly = true)
    public Page<PostsResponse> getBuyingPosts(int page, int size) {
        return searchPosts(null, null, null, PostTypeEnum.BUY.name(), null, null, null, null, null, page, size);
    }

    @Transactional(readOnly = true)
    public List<PostsResponse> getAllPosts() {
        return postsRepository.findAll().stream()
                .map(postsMapper::toPostsResponse)
                .toList();
    }

    // Lấy cities và price range từ posts có sẵn
    public record SearchFilters(List<String> cities, Long minPrice, Long maxPrice) {
    }

    @Transactional(readOnly = true)
    public SearchFilters getSearchFilters() {
        List<String> cities = postsRepository.findDistinctCities();
        Long minPrice = postsRepository.findMinPrice();
        Long maxPrice = postsRepository.findMaxPrice();
        return new SearchFilters(cities, minPrice != null ? minPrice : 0L, maxPrice != null ? maxPrice : 10000000L);
    }

    @Transactional(readOnly = true)
    public PostDetailResponse getDetailPost(String postId) {
        Posts post = postsRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        List<PostImage> postImages = (post.getPostImages() != null) ? post.getPostImages() : List.of();
        List<PostImageResponse> imageResponses = postsMapper.toPostImageResponse(postImages);

        var postDetailResponse = postsMapper.toPostDetailResponse(post);
        postDetailResponse.setPostImages(imageResponses);

        OrderOfPostResponse ordersOfPost = orderService.countOrdersOfPost(postId);
        postDetailResponse.setOrderCount(ordersOfPost.getOrderCount());
        postDetailResponse.setOrders(ordersOfPost.getOrders());

        return postDetailResponse;
    }

    @Transactional
    public PostDetailResponse createPost(PostCreateRequest request, List<MultipartFile> images) throws IOException {
        System.out.println("enter create post service");

        // Validate images
        if (images == null || images.isEmpty()) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        }
        if (images.size() > 10) {
            throw new AppException(ErrorCode.FILE_UPLOAD_LIMIT_EXCEEDED);
        }

        // 1. Lấy thông tin user
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = usersRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Chuyển đổi Request sang Entity
        Posts newPost = postsMapper.toPosts(request);
        newPost.setUser(currentUser);

        // Validate and convert payment methods with error handling
        if (request.getListAcceptedPaymentMethodsValue() != null
                && !request.getListAcceptedPaymentMethodsValue().isEmpty()) {
            try {
                List<PaymentMethodEnum> paymentEnums = request.getListAcceptedPaymentMethodsValue().stream()
                        .map(PaymentMethodEnum::valueOf) // Ép từ String ("DIRECT") sang kiểu Enum
                        .toList();
                newPost.setAcceptedPaymentMethods(paymentEnums); // Nhét vào Entity trước khi lưu
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
            }
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

        // Validate and convert PostType with error handling
        try {
            newPost.setPostType(PostTypeEnum.valueOf(request.getPostTypeName().trim()));
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_POST_TYPE);
        }

        // Set default status depending on post type: BUY -> SEARCHING, others ->
        // AVAILABLE
        if (newPost.getPostType() == PostTypeEnum.BUY) {
            newPost.setStatus(PostStatusEnum.SEARCHING);
        } else {
            newPost.setStatus(PostStatusEnum.AVAILABLE);
        }

        // 4. Xử lý Ảnh
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

        // 5. CHỐT HẠ: Lưu đúng 1 lần duy nhất!
        // Tránh lưu lắt nhắt gây lỗi Update/Delete không đáng có
        Posts savedPost = postsRepository.save(newPost);

        // Re-fetch to ensure all lazy relationships are loaded within transaction
        Posts postToReturn = postsRepository.findById(savedPost.getId())
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        return postsMapper.toPostDetailResponse(postToReturn);
    }

    @Transactional
    @PreAuthorize("@postValidationHelper.canEditPost(#postId) or hasRole('ADMIN')")
    public PostDeleteResponse deletePost(String postId) {
        var post = postsRepository.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        var user = SecurityContextHolder.getContext().getAuthentication();
        if (!post.getUser().getUsername().equals(user.getName())) {
            throw new AppException(ErrorCode.POST_CANNOT_DELETE);
        }
        post.setActive(false);
        postsRepository.save(post);
        return PostDeleteResponse.builder()
                .postId(postId)
                .result("Post deleted successfully")
                .build();
    }

    @Transactional
    @PreAuthorize("@postValidationHelper.canEditPost(#postId) or hasRole('ADMIN')")
    public PostDetailResponse editPost(String postId, PostEditRequest request, List<MultipartFile> images)
            throws IOException {
        Posts newPost = postsRepository.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        postsMapper.updatePostFromRequest(request, newPost); // MapStruct sẽ tự động cập nhật các trường cơ bản (title,
                                                             // price, status)
        if (request.getListAcceptedPaymentMethodsValue() != null
                && !request.getListAcceptedPaymentMethodsValue().isEmpty()) {
            List<PaymentMethodEnum> paymentEnums = request.getListAcceptedPaymentMethodsValue().stream()
                    .map(PaymentMethodEnum::valueOf) // Ép từ String ("DIRECT") sang kiểu Enum
                    .toList();

            newPost.setAcceptedPaymentMethods(paymentEnums); // Nhét vào Entity trước khi lưu
        }
        if (request.getStatus() != null) {
            newPost.setStatus(PostStatusEnum.valueOf(request.getStatus()));
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
        // 4.1 Xử lý các ảnh cũ đang có trong Database
        if (newPost.getPostImages() != null) {
            List<String> retainedUrls = request.getRetainedImageUrls() != null ? request.getRetainedImageUrls()
                    : new ArrayList<>();

            Iterator<PostImage> iterator = newPost.getPostImages().iterator();
            while (iterator.hasNext()) {
                PostImage oldImg = iterator.next();

                // Nếu ảnh cũ KHÔNG nằm trong danh sách giữ lại -> Xóa
                if (!retainedUrls.contains(oldImg.getImageUrl())) {

                    // --- CÁCH SỬA Ở ĐÂY ---
                    // Cắt lấy đoạn cuối cùng của URL (chính là tên file)
                    // Ví dụ: "http://domain.com/files/abc.jpg" -> "abc.jpg"
                    String fileUrl = oldImg.getImageUrl();
                    String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

                    try {
                        // Truyền đúng fileName vào
                        fileService.deleteMedia(fileName);
                    } catch (Exception e) {
                        // Dùng try-catch bọc lại. Lỡ file vật lý có bị ai đó xóa tay mất rồi
                        // thì code vẫn chạy tiếp để cập nhật bài viết chứ không bị văng lỗi 500
                        System.out.println("Lỗi xóa file vật lý (có thể file không tồn tại): " + fileName);
                    }

                    // Xóa khỏi Database
                    iterator.remove();
                }
            }
        }

        // 4.2 Xử lý và Upload các file ảnh MỚI (nếu có)
        if (images != null && !images.isEmpty()) {
            // Tìm sortOrder lớn nhất hiện tại để ảnh mới nối tiếp vào sau
            int currentMaxSortOrder = newPost.getPostImages().stream()
                    .mapToInt(PostImage::getSortOrder)
                    .max().orElse(-1);

            for (MultipartFile image : images) {
                try {
                    var imageUrl = fileService.uploadMedia(image);
                    PostImage postImage = new PostImage();
                    postImage.setImageUrl(imageUrl.getUrl());

                    // Nếu post chưa có ảnh nào thì ảnh đầu tiên là thumbnail
                    postImage.setIsThumbnail(newPost.getPostImages().isEmpty());
                    postImage.setSortOrder(++currentMaxSortOrder);

                    // Set khóa ngoại và thêm vào list
                    postImage.setPost(newPost);
                    newPost.getPostImages().add(postImage);
                } catch (IOException e) {
                    throw new AppException(ErrorCode.FILE_NOT_FOUND);
                }
            }
        }

        // 5. CHỐT HẠ: Lưu đúng 1 lần duy nhất!
        // Tránh lưu lắt nhắt gây lỗi Update/Delete không đáng có
        Posts savedPost = postsRepository.save(newPost);

        return postsMapper.toPostDetailResponse(savedPost);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<PostsResponse> getAllPostsAdmin(Pageable pageable) {
        Page<Posts> pagePosts = postsRepository.findInactivePosts(pageable);
        return pagePosts.map(postsMapper::toPostsResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostsResponse> myPost(int page, int size) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = usersRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Posts> pagePosts = postsRepository.findByUser(currentUser, pageable);
        ;
        return pagePosts.map(postsMapper::toPostsResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostsResponse> getPostsByUser(String userId, int page, int size) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Posts> pagePosts = postsRepository.findByUser(user, pageable);
        return pagePosts.map(postsMapper::toPostsResponse);
    }

}