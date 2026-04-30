package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.BannerDTO.BannerCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.BannerDTO.BannerUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Banner.BannerResponse;
import vn.edu.husc.taphoa2hand_backend.service.BannerService;

@RestController
@RequestMapping("/admin/banner")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminBannerController {
    BannerService bannerService;

    @GetMapping
    public ApiResponse<List<BannerResponse>> getAll() {
        return ApiResponse.<List<BannerResponse>>builder()
                .message("Lấy danh sách banner thành công")
                .result(bannerService.getAll())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BannerResponse> getById(@PathVariable String id) {
        return ApiResponse.<BannerResponse>builder()
                .message("Lấy thông tin banner thành công")
                .result(bannerService.getById(id))
                .build();
    }

    @PostMapping
    public ApiResponse<BannerResponse> create(@RequestBody BannerCreateRequest request,
            @RequestParam(value = "desktopFile", required = false) MultipartFile desktopFile,
            @RequestParam(value = "mobileFile", required = false) MultipartFile mobileFile) {
        
        return ApiResponse.<BannerResponse>builder()
                .message("Tạo banner thành công")
                .result(bannerService.create(request, desktopFile, mobileFile))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<BannerResponse> update(@PathVariable String id,
            @RequestBody BannerUpdateRequest request) {
        return ApiResponse.<BannerResponse>builder()
                .message("Cập nhật banner thành công")
                .result(bannerService.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<BannerResponse> delete(@PathVariable String id) {
        return ApiResponse.<BannerResponse>builder()
                .message("Xóa banner thành công")
                .result(bannerService.delete(id))
                .build();
    }
}
