package vn.edu.husc.taphoa2hand_backend.mapper;

import java.util.List;
import java.util.Set;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostAddressRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostDetailRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostImageRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.*;

@Mapper(componentModel = "spring")
public interface PostsMapper {
    
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "postDetail.id", target = "postDetailId")
    @Mapping(source = "postAddress.id", target = "postAddressId")
    PostsResponse toPostsResponse(Posts post);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    // XÓA các dòng ignore postDetail, postImages, postAddress đi 
    // vì bây giờ chúng ta muốn MapStruct map chúng từ Request sang!
    Posts toPosts(PostCreateRequest request);

    // MapStruct sẽ tự động gọi các hàm dưới đây khi chuyển đổi PostCreateRequest -> Posts
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "post", ignore = true)
    PostDetail toPostDetail(PostDetailRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "post", ignore = true)
    PostAddress toPostAddress(PostAddressRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "post", ignore = true)
    PostImage toPostImage(PostImageRequest request);

}