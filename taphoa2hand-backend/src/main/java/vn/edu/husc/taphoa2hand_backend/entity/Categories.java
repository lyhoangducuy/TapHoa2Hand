package vn.edu.husc.taphoa2hand_backend.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Table(name = "categories")
public class Categories {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    @Column(unique = true, nullable = false) // Tên danh mục nên duy nhất
    String name;

    @CreationTimestamp // Tự động điền thời gian khi tạo mới, không cần truyền từ FE
    @Column(updatable = false)
    LocalDateTime createdAt;
}