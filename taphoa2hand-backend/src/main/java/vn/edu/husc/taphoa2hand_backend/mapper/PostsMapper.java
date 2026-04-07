package vn.edu.husc.taphoa2hand_backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostAddressRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostDetailInfoRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostEditRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostImageRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PaymentMethodResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostAddressResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostDetailResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostImageResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.*;

@Mapper(componentModel = "spring")
public interface PostsMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "postDetail.id", target = "postDetailId")
    @Mapping(source = "postAddress.id", target = "postAddressId")
    PostsResponse toPostsResponse(Posts post);

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

    @Mapping(target = "acceptedPaymentMethods", ignore = true) // MapStruct sẽ không tự động map
                                                               // List<PaymentMethodResponse> sang
                                                               // List<PaymentMethodEnum>, chúng ta sẽ xử lý thủ công
                                                               // trong Service
    @Mapping(target = "id", ignore = true)
    Posts toPosts(PostDetailResponse postDetailResponse); // Hàm này sẽ map toàn bộ thông tin từ PostDetailResponse sang
                                                          // Posts, bao gồm cả các trường con như PostDetail,
                                                          // PostAddress, PostImage, PaymentMethodEnum, và Categories
    @Mapping(target = "id", ignore = true)
    Posts toPosts(PostEditRequest postEditRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
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
}