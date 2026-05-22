package vn.edu.husc.taphoa2hand_backend.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    // Không được để trống nội dung báo cáo
    @NotNull(message = "Lý do báo cáo là bắt buộc")
    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    ReportReasonEnum reason;

    @NotBlank(message = "Mô tả chi tiết là bắt buộc")
    @Size(min = 20, max = 2000, message = "Mô tả chi tiết phải từ 20 đến 2000 ký tự")
    String detail;

    // Phân loại báo cáo để dễ xử lý (ví dụ: SPAM, FRAUD, HARASSMENT)
    @NotNull(message = "Loại báo cáo là bắt buộc")
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    ReportTypeEnum type;

    // Người thực hiện báo cáo (Buyer/Seller)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    @NotNull(message = "Phải có thông tin người báo cáo")
    Users reporter;

    // Đối tượng bị báo cáo (có thể là User khác hoặc một Order cụ thể)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id")
    Users reportedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    Order order;

    /** Tin đăng bị báo cáo (type = POST). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    Posts reportedPost;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ReportEvidence> evidences = new ArrayList<>();

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ReportPenalty> penalties = new ArrayList<>();
    // Trạng thái xử lý của Admin
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    ReportStatusEnum status = ReportStatusEnum.PENDING;
    @Column(columnDefinition = "TEXT")
    String resolutionNote;

    // Người xử lý
    @ManyToOne
    Users reviewedBy;
}