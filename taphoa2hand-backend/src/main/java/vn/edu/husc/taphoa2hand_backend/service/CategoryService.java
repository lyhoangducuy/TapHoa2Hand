package vn.edu.husc.taphoa2hand_backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO.CategoryCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO.CategoryUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Categories.CategoryResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Categories;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.CategoriesMapper;
import vn.edu.husc.taphoa2hand_backend.repository.CategoryRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CategoryService {
    CategoryRepository categoryRepository;
    CategoriesMapper categoriesMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        System.out.println("getAllCategories called");
        return categoryRepository.findAll().stream()
                .map(categoriesMapper::toCategoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        Page<Categories> pageCategories = categoryRepository.findAll(pageable);
        return pageCategories.map(categoriesMapper::toCategoryResponse);
    }

    public CategoryResponse deleteCategory(String categoryId) {
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        category.setActive(false);
        categoryRepository.save(category);
        return categoriesMapper.toCategoryResponse(category);
    }

    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByName(request.getName()))
            throw new AppException(ErrorCode.CATEGORY_EXISTS);
        Categories category = categoriesMapper.toCategory(request);
        return categoriesMapper.toCategoryResponse(categoryRepository.save(category));
    }

    public CategoryResponse getDetail(String categoryId) {
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return categoriesMapper.toCategoryResponse(category);
    }

    public CategoryResponse updateCategory(String categoryId, CategoryUpdateRequest categoryRequest) {
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        category.setName(categoryRequest.getName());
        categoryRepository.save(category);
        return categoriesMapper.toCategoryResponse(category);

    }
}
