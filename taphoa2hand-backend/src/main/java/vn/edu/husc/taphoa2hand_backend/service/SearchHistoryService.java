package vn.edu.husc.taphoa2hand_backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.PostTypeEnum;
import vn.edu.husc.taphoa2hand_backend.entity.SearchHistory;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.repository.SearchHistoryRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SearchHistoryService {
    @Autowired
    SearchHistoryRepository searchHistoryRepository;

    @Transactional
    public void saveSearchHistory(
            Users user,
            String keyword,
            String location,
            String categoryId,
            String postType,
            String minPrice,
            String maxPrice,
            String sortBy,
            String dateFrom,
            String dateTo) {

        SearchHistory searchHistory = SearchHistory.builder()
                .user(user)
                .keyword(keyword)
                .location(location)
                .categoryId(categoryId)
                .postType(postType != null ? PostTypeEnum.valueOf(postType) : null)
                .minPrice(minPrice != null ? new BigDecimal(minPrice) : null)
                .maxPrice(maxPrice != null ? new BigDecimal(maxPrice) : null)
                .sortBy(sortBy)
                .dateFrom(dateFrom != null ? LocalDate.parse(dateFrom) : null)
                .dateTo(dateTo != null ? LocalDate.parse(dateTo) : null)
                .build();

        searchHistoryRepository.save(searchHistory);
    }

    public List<String> getSearchKeywordsByUserId(
            String userId) {

        List<SearchHistory> histories = searchHistoryRepository
                .findByUserIdAndKeywordIsNotNullOrderByCreatedAtDesc(
                        userId);

        return histories.stream()
                .map(SearchHistory::getKeyword)
                .filter(keyword -> !keyword.isBlank())
                .distinct()
                .toList();
    }

}
