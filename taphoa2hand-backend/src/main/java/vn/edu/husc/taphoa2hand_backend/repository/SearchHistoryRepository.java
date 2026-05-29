package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.SearchHistory;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

@Repository
public interface SearchHistoryRepository
        extends JpaRepository<SearchHistory, String> {

    List<SearchHistory> findByUserOrderByCreatedAtDesc(Users user);

    Optional<SearchHistory> findByUserAndKeyword(
            Users user,
            String keyword);

    @Query("""
                SELECT DISTINCT s.keyword
                FROM SearchHistory s
                WHERE s.user.id = :userId
                AND s.keyword IS NOT NULL
                AND s.keyword != ''
                ORDER BY MAX(s.createdAt) DESC
            """)
    List<String> findKeywordsByUserId(String userId);

    List<SearchHistory> findByUserIdAndKeywordIsNotNullOrderByCreatedAtDesc(
            String userId);

    List<SearchHistory> findTop5ByUserIdAndKeywordIsNotNullOrderByCreatedAtDesc(
            String userId);

    List<SearchHistory> findTop20ByUserIdAndKeywordIsNotNullOrderByCreatedAtDesc(
            String userId);
}