package vn.edu.husc.taphoa2hand_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "reports")
public class Report extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    Users reporter; // Người gửi đơn tố cáo

    // Tố cáo có thể dành cho một Bài viết (Post)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    Posts targetPost;
    // Hoặc tố cáo trực tiếp một Đơn hàng (Order)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    Order targetOrder;

    // Hoặc tố cáo trực tiếp một Người dùng (User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    Users targetUser;

    @Column(nullable = false)
    String reason; // Lý do: Lừa đảo, hàng giả, ngôn từ thù ghét...

    @Column(columnDefinition = "TEXT")
    String details; // Chi tiết nội dung tố cáo

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ReportStatus status = ReportStatus.PENDING; // PENDING, PROCESSED, REJECTED

    public enum ReportStatus {
        PENDING, PROCESSED, REJECTED
    }
}