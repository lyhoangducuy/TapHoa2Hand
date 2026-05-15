package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.ProvinceOptionResponse;
import vn.edu.husc.taphoa2hand_backend.service.LocationService;

@RestController
@RequestMapping("/location")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LocationController {

    LocationService locationService;

    @GetMapping("/provinces")
    public ApiResponse<List<ProvinceOptionResponse>> getProvinces() {
        return ApiResponse.<List<ProvinceOptionResponse>>builder()
                .message("Lấy danh sách tỉnh/thành thành công")
                .result(locationService.getAllProvinces())
                .build();
    }

    @GetMapping("/provinces/{provinceCode}/wards")
    public ApiResponse<List<ProvinceOptionResponse>> getWardsByProvince(@PathVariable String provinceCode) {
        try {
            return ApiResponse.<List<ProvinceOptionResponse>>builder()
                    .message("Lấy danh sách phường/xã thành công")
                    .result(locationService.getWardsByProvinceCode(provinceCode))
                    .build();
        } catch (NumberFormatException ex) {
            return ApiResponse.<List<ProvinceOptionResponse>>builder()
                    .code(4000)
                    .message("Mã tỉnh/thành không hợp lệ")
                    .result(List.of())
                    .build();
        }
    }
}
