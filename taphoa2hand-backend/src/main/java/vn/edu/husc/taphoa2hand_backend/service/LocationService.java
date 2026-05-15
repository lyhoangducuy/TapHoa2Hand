package vn.edu.husc.taphoa2hand_backend.service;

import java.text.Collator;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.DistrictWithWardsResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.ProvinceOptionResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.ProvinceWithDistrictsResponse;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LocationService {

    static final String PROVINCES_OPEN_API_BASE = "https://provinces.open-api.vn/api/p/";
    static final String DISTRICTS_OPEN_API_BASE = "https://provinces.open-api.vn/api/d/";

    RestTemplate restTemplate;

    public List<ProvinceOptionResponse> getAllProvinces() {
        ProvinceOptionResponse[] rows = restTemplate.getForObject(PROVINCES_OPEN_API_BASE, ProvinceOptionResponse[].class);
        if (rows == null) {
            return List.of();
        }
        Collator collator = Collator.getInstance(new Locale("vi", "VN"));
        return Arrays.stream(rows)
                .filter(p -> p.getCode() != null && p.getName() != null && !p.getName().isBlank())
                .sorted(Comparator.comparing(ProvinceOptionResponse::getName, collator))
                .collect(Collectors.toList());
    }

    /**
     * Gom toàn bộ Phường/Xã thuộc một Tỉnh/Thành (open-api: tỉnh ?depth=2 → quận/huyện, mỗi quận ?depth=2 → wards).
     */
    public List<ProvinceOptionResponse> getWardsByProvinceCode(String provinceCodeStr) {
        int provinceCode = Integer.parseInt(provinceCodeStr.trim());
        String provinceUrl = PROVINCES_OPEN_API_BASE + provinceCode + "?depth=2";
        ProvinceWithDistrictsResponse province = restTemplate.getForObject(provinceUrl, ProvinceWithDistrictsResponse.class);
        if (province == null || province.getDistricts() == null || province.getDistricts().isEmpty()) {
            return List.of();
        }
        Collator collator = Collator.getInstance(new Locale("vi", "VN"));
        List<ProvinceOptionResponse> all = new ArrayList<>();
        for (ProvinceOptionResponse district : province.getDistricts()) {
            if (district.getCode() == null) {
                continue;
            }
            String districtUrl = DISTRICTS_OPEN_API_BASE + district.getCode() + "?depth=2";
            DistrictWithWardsResponse body = restTemplate.getForObject(districtUrl, DistrictWithWardsResponse.class);
            if (body == null || body.getWards() == null) {
                continue;
            }
            for (ProvinceOptionResponse ward : body.getWards()) {
                if (ward.getCode() != null && ward.getName() != null && !ward.getName().isBlank()) {
                    all.add(ward);
                }
            }
        }
        all.sort(Comparator.comparing(ProvinceOptionResponse::getName, collator));
        return all;
    }
}
