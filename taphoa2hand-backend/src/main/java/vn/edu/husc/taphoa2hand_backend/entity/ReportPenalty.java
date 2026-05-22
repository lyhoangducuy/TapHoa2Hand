package vn.edu.husc.taphoa2hand_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_penalties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportPenalty extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PenaltyActionEnum action;

    @Column(columnDefinition = "TEXT")
    private String note;
}