package vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO;

import java.math.BigDecimal;
import java.util.List;

public record PostAiCheckRecord(
        String postId,
        String title,
        BigDecimal price,
        // Các trường từ PostDetail
        String brand,
        String model,
        String condition,
        String usedDuration,
        String reasonForSelling,
        String description,
        // Hình ảnh từ PostImage
        List<String> imageUrls 
) {
}