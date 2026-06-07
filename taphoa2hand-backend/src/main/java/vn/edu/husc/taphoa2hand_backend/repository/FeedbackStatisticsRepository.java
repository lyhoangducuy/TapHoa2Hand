package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.husc.taphoa2hand_backend.entity.Feedback;

import java.util.List;

@Repository
public interface FeedbackStatisticsRepository extends JpaRepository<Feedback, String> {

    // Rating distribution (count per star)
    @Query(value = """
        SELECT f.rating as rating, COUNT(*) as count
        FROM feedbacks f
        GROUP BY f.rating
        ORDER BY f.rating DESC
        """, nativeQuery = true)
    List<Object[]> getRatingDistribution();
}
