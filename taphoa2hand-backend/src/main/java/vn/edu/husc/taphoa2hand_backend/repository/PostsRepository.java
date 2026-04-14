package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum; // Thêm import này

@Repository
public interface PostsRepository extends JpaRepository<Posts, String> {

        @Query(value = "SELECT DISTINCT p FROM Posts p " +
                        "LEFT JOIN p.postAddress a " +
                        "LEFT JOIN p.categories c " +
                        "WHERE (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                        "AND (:location IS NULL OR :location = '' OR LOWER(a.city) LIKE LOWER(CONCAT('%', :location, '%')) OR LOWER(a.ward) LIKE LOWER(CONCAT('%', :location, '%'))) "
                        +
                        "AND (:categoryName IS NULL OR :categoryName = '' OR c.name = :categoryName) " +
                        "AND (:status IS NULL OR p.status = :status)", countQuery = "SELECT COUNT(DISTINCT p) FROM Posts p "
                                        +
                                        "LEFT JOIN p.postAddress a " +
                                        "LEFT JOIN p.categories c " +
                                        "WHERE (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
                                        +
                                        "AND (:location IS NULL OR :location = '' OR LOWER(a.city) LIKE LOWER(CONCAT('%', :location, '%')) OR LOWER(a.ward) LIKE LOWER(CONCAT('%', :location, '%'))) "
                                        +
                                        "AND (:categoryName IS NULL OR :categoryName = '' OR c.name = :categoryName) " +
                                        "AND (:status IS NULL OR p.status = :status)")
        Page<Posts> searchPosts(@Param("keyword") String keyword,
                        @Param("location") String location,
                        @Param("categoryName") String categoryName,
                        @Param("status") PostStatusEnum status,
                        Pageable pageable);

}