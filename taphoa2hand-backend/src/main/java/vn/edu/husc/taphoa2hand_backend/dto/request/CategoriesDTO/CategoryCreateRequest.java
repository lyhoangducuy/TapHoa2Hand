package vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO;

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
public class CategoryCreateRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    String name;
}
