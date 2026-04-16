package vn.edu.husc.taphoa2hand_backend.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Where;

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
@Where(clause = "active = true")
public class Categories extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    @Column(unique = true, nullable = false) // Tên danh mục nên duy nhất
    String name;

    @Builder.Default
    boolean active = true;
}