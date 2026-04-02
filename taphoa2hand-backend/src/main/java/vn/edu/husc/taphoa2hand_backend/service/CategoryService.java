package vn.edu.husc.taphoa2hand_backend.service;

import java.net.CacheResponse;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.CategoriesDTO.CategoryCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Categories.CategoryResponse;
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

    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByName(request.getName()))
            throw new AppException(ErrorCode.CATEGORY_EXISTS);
        var category = categoriesMapper.toCategory(request);
        return categoriesMapper.toCategoryResponse(categoryRepository.save(category));
    }
}
