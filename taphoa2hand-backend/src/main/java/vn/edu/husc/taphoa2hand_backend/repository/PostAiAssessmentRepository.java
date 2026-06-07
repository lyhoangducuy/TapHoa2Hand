package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.edu.husc.taphoa2hand_backend.entity.PostAiAssessment;

import java.util.List;

@Repository
public interface PostAiAssessmentRepository extends JpaRepository<PostAiAssessment, String> {

    // AI assessment distribution by isMatching
    @Query(value = """
        SELECT 
            CASE 
                WHEN p.isMatching = true THEN 'NORMAL'
                ELSE 'SUSPICIOUS'
            END as assessment,
            COUNT(*) as count
        FROM post_ai_assessment p
        GROUP BY p.isMatching
        ORDER BY count DESC
        """, nativeQuery = true)
    List<Object[]> getAssessmentDistribution();

    // AI assessment by wear level
    @Query(value = """
        SELECT p.estimatedWearLevel as wearLevel, COUNT(*) as count
        FROM post_ai_assessment p
        WHERE p.estimatedWearLevel IS NOT NULL
        GROUP BY p.estimatedWearLevel
        ORDER BY count DESC
        """, nativeQuery = true)
    List<Object[]> getWearLevelDistribution();
}
