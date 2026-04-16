package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.List;
import java.util.Locale.Category;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO.CategoryCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Categories.CategoryResponse;
import vn.edu.husc.taphoa2hand_backend.service.CategoryService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {
    CategoryService categoryService;
    @GetMapping("/getAll")
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        System.out.println("getAllCategories endpoint called");
        return ApiResponse.<List<CategoryResponse>>builder()
                .message("Lấy danh sách danh mục thành công")
                .result(categoryService.getAllCategories())
                .build();
    }
    @PostMapping("/create")
    public ApiResponse<CategoryResponse> postMethodName(@RequestBody CategoryCreateRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .message("Tạo danh mục thành công")
                .result(categoryService.createCategory(request))
                .build();
    }
    
}
