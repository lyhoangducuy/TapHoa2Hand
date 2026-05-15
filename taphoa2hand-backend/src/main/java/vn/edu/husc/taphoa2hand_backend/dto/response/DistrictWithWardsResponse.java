package vn.edu.husc.taphoa2hand_backend.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DistrictWithWardsResponse {
    private Integer code;
    private String name;
    private List<ProvinceOptionResponse> wards;
}
