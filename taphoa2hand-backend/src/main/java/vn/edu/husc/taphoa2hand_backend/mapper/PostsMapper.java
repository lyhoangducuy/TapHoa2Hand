package vn.edu.husc.taphoa2hand_backend.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostAddressRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostAiCheckRecord;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostDetailInfoRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostEditRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostImageRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PaymentMethodResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostAddressResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDetailResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostImageResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostStatusResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostTypeResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.*;

@Mapper(componentModel = "spring")
public interface PostsMapper {


    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "postDetail.id", target = "postDetailId")
    @Mapping(source = "postAddress.id", target = "postAddressId")
    @Mapping(source = "postType", target = "postType", qualifiedByName = "postTypeToResponse")
    @Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
    PostsResponse toPostsResponse(Posts post);

    @Named("statusToString")
    default PostStatusResponse statusToString(PostStatusEnum status) {
        if (status == null) {
            return null;
        }
        return PostStatusResponse.builder()
                .name(status.getName())
                .displayName(status.getDisplayName())
                .build();
    }

    @Named("postTypeToResponse")
    default PostTypeResponse toPostType(PostTypeEnum postTypeEnum) {
        if (postTypeEnum == null) {
            return null;
        }
        return PostTypeResponse.builder()
                .name(postTypeEnum.getName())
                .displayName(postTypeEnum.getDisplayName())
                .build();
    }

    PostDetailResponse toPostDetailResponse(PostDetail postDetail);

    PostAddressResponse toPostAddressResponse(PostAddress postAddress);

    List<PostImageResponse> toPostImageResponse(List<PostImage> postImages);

    List<PaymentMethodResponse> toPaymentMethodResponse(List<PaymentMethodEnum> paymentMethods);

    PostDetailResponse toPostDetailResponse(Posts post); // Hàm này sẽ map toàn bộ thông tin từ Posts sang
                                                         // PostDetailResponse, bao gồm cả các trường con như
                                                         // PostDetail, PostAddress, PostImage, PaymentMethodEnum, và
                                                         // Categories

    @Mapping(target = "categories", ignore = true) // MapStruct sẽ không tự động map Set<Categories> sang
                                                   // Set<CategoryResponse>, chúng ta sẽ xử lý thủ công trong Service
    @Mapping(target = "acceptedPaymentMethods", ignore = true) // MapStruct sẽ không
    @Mapping(target = "postImages", ignore = true) // MapStruct sẽ không tự động map List<PostImage> sang
                                                   // List<PostImageResponse>, chúng ta sẽ xử lý thủ công trong Service
    @Mapping(target = "postAddress", ignore = true) // MapStruct sẽ không tự
    @Mapping(target = "user", ignore = true) // MapStruct sẽ không tự động map Users sang UsersResponse, chúng ta sẽ xử
                                             // lý thủ công trong Service
    @Mapping(target = "postDetail", source = "postDetail") // MapStruct sẽ tự động map PostDetail sang
                                                           // PostDetailInfoResponse nếu chúng ta có hàm chuyển đổi
                                                           // tương ứng
    PostDetailResponse toDetailResponse(Posts post); // Hàm này sẽ map toàn bộ thông tin từ Posts sang
                                                     // PostDetailResponse, bao gồm cả các trường con như PostDetail,
                                                     // PostAddress, PostImage, PaymentMethodEnum, và Categories

    PostDetail toPostDetail(PostDetailResponse postDetailResponse); // Hàm này sẽ map toàn bộ thông tin từ
                                                                    // PostDetailResponse sang PostDetail, bao gồm cả
                                                                    // các trường con như PostDetailInfoResponse,
                                                                    // PostAddressResponse, PostImageResponse,
                                                                    // PaymentMethodResponse, và CategoryResponse

    PostAddress toPostAddress(PostAddressResponse postAddressResponse); // Hàm này sẽ map toàn bộ thông tin từ
                                                                        // PostAddressResponse sang PostAddress

    List<PostImage> toPostImage(List<PostImageResponse> postImageResponses); // Hà

  
    
    @Mapping(target = "id", ignore = true)
    Posts toPosts(PostEditRequest postEditRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "acceptedPaymentMethods", ignore = true)
    // Cho phép MapStruct tự map Detail, Address, Images từ DTO sang Entity
    Posts toPosts(PostCreateRequest request);

    // Cần có các hàm phụ này để MapStruct biết cách map list/object con
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "post", ignore = true) // Sẽ set bằng tay ở Service
    PostDetail toPostDetail(PostDetailInfoRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "post", ignore = true) // Sẽ set bằng tay ở Service
    PostAddress toPostAddress(PostAddressRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "post", ignore = true) // Sẽ set bằng tay ở Service
    PostImage toPostImage(PostImageRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true) // Đừng để mất ngày tạo cũ
    @Mapping(target = "user", ignore = true) // Đừng để mất thông tin người bán cũ
    @Mapping(target="status", ignore = true) // Đừng để mất trạng thái cũ
    // Tuỳ vào logic, bạn có thể cần ignore thêm các trường khác
    void updatePostFromRequest(PostEditRequest request, @MappingTarget Posts post);

   public static PostAiCheckRecord toAiCheckRecord(Posts post) {
        // 1. Lấy danh sách URL ảnh (Kiểm tra null an toàn)
        List<String> imageUrls = (post.getPostImages() != null) 
            ? post.getPostImages().stream()
                  .map(PostImage::getImageUrl) // Đảm bảo PostImage có hàm getImageUrl()
                  .collect(Collectors.toList())
            : List.of();

        // 2. Khởi tạo các giá trị mặc định cho PostDetail
        String brand = "Không rõ";
        String model = "Không rõ";
        String condition = "Không rõ";
        String usedDuration = "Không rõ";
        String reasonForSelling = "Không có";
        String description = "Không có mô tả";
        
        // 3. Gán giá trị thực tế nếu PostDetail tồn tại
        PostDetail detail = post.getPostDetail();
        if (detail != null) {
            brand = detail.getBrand() != null ? detail.getBrand() : brand;
            model = detail.getModel() != null ? detail.getModel() : model;
            condition = detail.getCondition() != null ? detail.getCondition() : condition;
            usedDuration = detail.getUsedDuration() != null ? detail.getUsedDuration() : usedDuration;
            reasonForSelling = detail.getReasonForSelling() != null ? detail.getReasonForSelling() : reasonForSelling;
            description = detail.getDescription() != null ? detail.getDescription() : description;
        }

        // 4. Trả về record
        return new PostAiCheckRecord(
                post.getId(),
                post.getTitle(),
                post.getPrice(),
                brand,
                model,
                condition,
                usedDuration,
                reasonForSelling,
                description,
                imageUrls
        );
    }
}