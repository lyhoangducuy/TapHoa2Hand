package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.service.PostsService;
import vn.edu.husc.taphoa2hand_backend.service.SearchHistoryService;

@RestController
@RequestMapping("/search-history")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SearchHistoryController {
    SearchHistoryService searchHistoryService;

    @GetMapping("/{userId}")
    public ApiResponse<List<String>> getSearchHistory(
            @PathVariable String userId) {
        return ApiResponse.<List<String>>builder()
                .message("Lấy lịch sử tìm kiếm thành công")
                .result(searchHistoryService.getSearchKeywordsByUserId(userId))
                .build();
    }      
     
}
