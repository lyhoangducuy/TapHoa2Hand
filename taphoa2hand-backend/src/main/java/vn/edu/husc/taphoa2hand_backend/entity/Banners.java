package vn.edu.husc.taphoa2hand_backend.entity;

import java.time.Instant;
import java.time.LocalDateTime;

import org.springframework.cglib.core.Local;
import org.springframework.data.annotation.CreatedDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Banners {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String title;
    String imageDesktop;
    String imageMobile;
    String targetUrl;
    Integer sortOrder;
    Boolean isActive;
    LocalDateTime startDate;
    LocalDateTime endDate;
    @CreatedDate
    LocalDateTime createdAt;
    
    LocalDateTime updatedAt;

    
}
