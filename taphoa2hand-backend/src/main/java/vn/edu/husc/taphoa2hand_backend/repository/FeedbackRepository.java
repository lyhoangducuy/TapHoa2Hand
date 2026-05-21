package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.husc.taphoa2hand_backend.entity.Feedback;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, String>,JpaSpecificationExecutor<Feedback> {

    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.reviewer LEFT JOIN FETCH f.targetUser WHERE f.order.id = :orderId")
    Optional<Feedback> findByOrderId(String orderId);

    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.reviewer LEFT JOIN FETCH f.targetUser WHERE f.targetUser.id = :targetUserId")
    Page<Feedback> findByTargetUser(String targetUserId, Pageable pageable);

    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.reviewer LEFT JOIN FETCH f.targetUser WHERE f.reviewer.id = :reviewerId")
    Page<Feedback> findByReviewer(String reviewerId, Pageable pageable);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.targetUser.id = :userId")
    Double getAverageRatingByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.targetUser.id = :userId")
    Long countFeedbackByUserId(@Param("userId") String userId);

    List<Feedback> findByTargetUserIdOrderByCreatedAtDesc(String targetUserId);

    @Query("""
                SELECT COALESCE(AVG(f.rating), 0)
                FROM Feedback f
                WHERE f.targetUser.id = :userId
            """)
    Double getAverageRatingByTargetUser(@Param("userId") String userId);

    @Query("""
                SELECT f FROM Feedback f
                LEFT JOIN FETCH f.order o
                LEFT JOIN FETCH f.reviewer r
                LEFT JOIN FETCH f.targetUser t
                LEFT JOIN FETCH f.mediaList m
                WHERE f.targetUser.id = :userId
                ORDER BY f.createdAt DESC
            """)
    List<Feedback> findFullByTargetUser(@Param("userId") String userId);

}
