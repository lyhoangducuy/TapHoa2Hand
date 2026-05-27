package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum; // Thêm import này
import vn.edu.husc.taphoa2hand_backend.entity.PostTypeEnum; // Thêm import này
import java.util.List;

@Repository
public interface PostsRepository extends JpaRepository<Posts, String> {

        @Query(value = "SELECT DISTINCT p FROM Posts p " +
                        "LEFT JOIN p.postAddress a " +
                        "LEFT JOIN p.categories c " +
                        "WHERE (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                        "AND (:location IS NULL OR :location = '' OR LOWER(a.city) LIKE LOWER(CONCAT('%', :location, '%')) OR LOWER(a.ward) LIKE LOWER(CONCAT('%', :location, '%'))) "
                        +
                        "AND (:categoryId IS NULL OR :categoryId = '' OR c.id = :categoryId) " +
                        "AND (:postType IS NULL OR p.postType = :postType) " +
                        "AND (:statuses IS NULL OR p.status IN :statuses) " +
                        "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
                        "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
                        "AND (:dateFrom IS NULL OR DATE(p.createdAt) >= DATE(:dateFrom)) " +
                        "AND (:dateTo IS NULL OR DATE(p.createdAt) <= DATE(:dateTo))", countQuery = "SELECT COUNT(DISTINCT p) FROM Posts p "
                                        +
                                        "LEFT JOIN p.postAddress a " +
                                        "LEFT JOIN p.categories c " +
                                        "WHERE (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
                                        +
                                        "AND (:location IS NULL OR :location = '' OR LOWER(a.city) LIKE LOWER(CONCAT('%', :location, '%')) OR LOWER(a.ward) LIKE LOWER(CONCAT('%', :location, '%'))) "
                                        +
                                        "AND (:categoryId IS NULL OR :categoryId = '' OR c.id = :categoryId) " +
                        "AND (:postType IS NULL OR p.postType = :postType) " +
                        "AND (:statuses IS NULL OR p.status IN :statuses) " +
                        "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
                        "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
                        "AND (:dateFrom IS NULL OR DATE(p.createdAt) >= DATE(:dateFrom)) " +
                        "AND (:dateTo IS NULL OR DATE(p.createdAt) <= DATE(:dateTo))")
        Page<Posts> searchPosts(@Param("keyword") String keyword,
                        @Param("location") String location,
                        @Param("categoryId") String categoryId,
                        @Param("postType") PostTypeEnum postType,
                        @Param("statuses") List<PostStatusEnum> statuses,
                        @Param("minPrice") Long minPrice,
                        @Param("maxPrice") Long maxPrice,
                        @Param("dateFrom") String dateFrom,
                        @Param("dateTo") String dateTo,
                        Pageable pageable);

        Page<Posts> findByUser(Users user, Pageable pageable);

        @Query(
        value = "SELECT * FROM posts WHERE active = 1 ORDER BY created_at DESC",
        countQuery = "SELECT count(*) FROM posts WHERE active = 1",
        nativeQuery = true
    )
    Page<Posts> findInactivePosts(Pageable pageable);

    // Lấy danh sách thành phố duy nhất từ các bài post (chỉ lấy status không phải SOLD hoặc HIDDEN)
    @Query("SELECT DISTINCT a.city FROM Posts p JOIN p.postAddress a WHERE p.status NOT IN ('SOLD', 'HIDDEN') AND a.city IS NOT NULL AND a.city <> '' ORDER BY a.city")
    List<String> findDistinctCities();

    // Lấy giá thấp nhất từ các bài post (chỉ lấy status không phải SOLD hoặc HIDDEN)
    @Query("SELECT MIN(p.price) FROM Posts p WHERE p.status NOT IN ('SOLD', 'HIDDEN')")
    Long findMinPrice();

    // Lấy giá cao nhất từ các bài post (chỉ lấy status không phải SOLD hoặc HIDDEN)
    @Query("SELECT MAX(p.price) FROM Posts p WHERE p.status NOT IN ('SOLD', 'HIDDEN')")
    Long findMaxPrice();

}