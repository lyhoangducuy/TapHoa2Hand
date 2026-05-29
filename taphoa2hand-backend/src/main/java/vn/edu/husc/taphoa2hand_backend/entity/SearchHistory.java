package vn.edu.husc.taphoa2hand_backend.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    private String keyword;

    private String location;

    private String categoryId;

    @Enumerated(EnumType.STRING)
    private PostTypeEnum postType;

    private BigDecimal minPrice;

    private BigDecimal maxPrice;

    private String sortBy;

    private LocalDate dateFrom;

    private LocalDate dateTo;
}