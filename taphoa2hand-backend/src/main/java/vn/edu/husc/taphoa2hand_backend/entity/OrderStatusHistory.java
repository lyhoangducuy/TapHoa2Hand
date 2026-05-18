package vn.edu.husc.taphoa2hand_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "order_status_history")
public class OrderStatusHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    OrderStatusEnum fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    OrderStatusEnum toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    Users changedBy;

    // BUYER / SELLER / ADMIN / SYSTEM
    @Column(length = 20)
    String actorRole;

    @Column(columnDefinition = "TEXT")
    String note;
}