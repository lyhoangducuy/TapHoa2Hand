package vn.edu.husc.taphoa2hand_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostAiAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String postId; // Dùng chung ID với Post luôn cho dễ quản lý

    boolean isMatching;
    String estimatedWearLevel;

    @Column(columnDefinition = "TEXT")
    String reason;

    @Column(columnDefinition = "TEXT")
    String recommendation;

    LocalDateTime lastAnalyzedAt; // Thời điểm thẩm định gần nhất

    @OneToOne
    @MapsId
    @JoinColumn(name = "post_id")
    @EqualsAndHashCode.Exclude // Thêm cái này
    @ToString.Exclude
    Posts post;
}
