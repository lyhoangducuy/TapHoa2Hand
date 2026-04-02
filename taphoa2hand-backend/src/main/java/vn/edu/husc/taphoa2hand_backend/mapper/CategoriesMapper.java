package vn.edu.husc.taphoa2hand_backend.mapper;

import java.util.List;
import java.util.Set;

import org.mapstruct.Mapper;

import vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO.CategoryCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO.CategoryRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Categories.CategoryResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Categories;

@Mapper(componentModel = "spring")
public interface CategoriesMapper {
    CategoryResponse toCategoryResponse(Categories category);
    Categories toCategory(CategoryCreateRequest request);
    Set<CategoryResponse> toCategoryResponse(Set<Categories> categories);
    Set<Categories> toCategory(Set<CategoryResponse> categoryResponses);
}
