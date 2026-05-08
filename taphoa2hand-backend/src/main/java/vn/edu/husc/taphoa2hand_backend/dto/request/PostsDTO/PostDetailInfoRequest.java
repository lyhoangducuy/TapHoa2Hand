package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class PostDetailInfoRequest {
    @NotBlank(message = "Mô tả chi tiết không được để trống")
    @Size(min = 10, max = 5000, message = "Mô tả chi tiết phải có độ dài từ 10 đến 5000 ký tự")
    String description;
    
    String brand; // Optional
    
    String model; // Optional
    
    @NotBlank(message = "Tình trạng sản phẩm không được để trống")
    @Size(min = 2, max = 100, message = "Tình trạng sản phẩm phải có độ dài từ 2 đến 100 ký tự")
    String itemCondition;
    
    String usedDuration; // Optional
    
    String reasonForSelling; // Optional
}