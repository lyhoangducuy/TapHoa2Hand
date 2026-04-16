package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO.CategoryCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO.CategoryRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO.CategoryUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Categories.CategoryResponse;
import vn.edu.husc.taphoa2hand_backend.service.CategoryService;
import org.springframework.data.domain.Sort;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;




@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminCategoryController {
    CategoryService categoryService;
    @GetMapping
    public ApiResponse<Page<CategoryResponse>> getCategory(@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable){
        return ApiResponse.<Page<CategoryResponse>>builder()
                .message("Lay category thanh cong")
                .result(categoryService.getAllCategories(pageable))
                .build();
    }
    @GetMapping("/{categoryId}")
    public ApiResponse<CategoryResponse> getDetail(@PathVariable String categoryId) {
        return ApiResponse.<CategoryResponse>builder()
                .message("Lay category detail thanh cong")
                .result(categoryService.getDetail(categoryId))
                .build();
    }
    @PutMapping("/{categoryId}/update")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable @Valid String categoryId,
                @RequestBody CategoryUpdateRequest request){
        return ApiResponse.<CategoryResponse>builder()
                .message("Chinh sua category thanh cong")
                .result(categoryService.updateCategory(categoryId,request))
                .build();
    }
    @DeleteMapping("/{categoryId}/delete")
    public ApiResponse<CategoryResponse> deleteCategory(@PathVariable String categoryId){
        return ApiResponse.<CategoryResponse>builder()
                .message("Xoa thanh cong")
                .result(categoryService.deleteCategory(categoryId))
                .build();
    }
    @PostMapping("/create")
    public ApiResponse<CategoryResponse> createCategory(@RequestBody CategoryCreateRequest request) {
       return ApiResponse.<CategoryResponse>builder()
                .message("Tao thanh cong")
                .result(categoryService.createCategory(request))
                .build();
    }
    
    
}
