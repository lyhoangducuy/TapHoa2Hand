package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;

import vn.edu.husc.taphoa2hand_backend.dto.request.BannerDTO.BannerCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.BannerDTO.BannerUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Banner.BannerResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Banners;

@Mapper(componentModel = "spring")
public interface BannerMapper {
    BannerResponse toBannerResponse(Banners banner);
    Banners toBanner(BannerCreateRequest request);
    Banners toBanner(BannerUpdateRequest request);
}
