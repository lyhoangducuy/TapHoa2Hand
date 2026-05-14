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
public class Report extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    // Không được để trống nội dung báo cáo
    @NotBlank(message = "Nội dung báo cáo không được để trống")
    @Size(min = 10, max = 1000, message = "Nội dung phải từ 10 đến 1000 ký tự")
    String reason;

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
    // Trạng thái xử lý của Admin
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
     ReportStatusEnum status = ReportStatusEnum.PENDING;
}