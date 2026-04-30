package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Banner.BannerResponse;
import vn.edu.husc.taphoa2hand_backend.service.BannerService;

@RestController
@RequestMapping("/banners")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class BannerController {
    BannerService bannerService;

    @GetMapping
    public ApiResponse<List<BannerResponse>> getActiveBanners() {
        return ApiResponse.<List<BannerResponse>>builder()
                .message("Lấy danh sách banner thành công")
                .result(bannerService.getActiveBanners())
                .build();
    }
}