package vn.edu.husc.taphoa2hand_backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class FeedbackDTO {
    @NotBlank(message = "Order ID không được để trống")
    String orderId;
    
    @Min(value = 1, message = "Rating phải từ 1 đến 5 sao")
    @Max(value = 5, message = "Rating phải từ 1 đến 5 sao")
    int rating;
    
    String comment;
    
    String imageUrl;
}
