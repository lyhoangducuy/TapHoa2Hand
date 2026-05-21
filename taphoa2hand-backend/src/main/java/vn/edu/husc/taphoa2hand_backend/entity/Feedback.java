package vn.edu.husc.taphoa2hand_backend.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "feedbacks")
public class Feedback extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order; // Mỗi đơn hàng chỉ có 1 feedback

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    Users reviewer; // Người đánh giá (Buyer)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", nullable = false)
    Users targetUser; // Người bị đánh giá (Seller)

    @Min(1) @Max(5)
    int rating; // Số sao (1-5)

    @Column(columnDefinition = "TEXT")
    String comment;

     @OneToMany(mappedBy = "feedback", cascade = CascadeType.ALL, orphanRemoval = true)
    List<FeedbackMedia> mediaList = new ArrayList<>();// Hình ảnh thực tế khách chụp
}