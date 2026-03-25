package vn.edu.husc.taphoa2hand_backend.entity;

import java.time.LocalDate;
import java.util.List;

import org.springframework.cglib.core.Local;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PostDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String description;
    String brand;
    String model;
    // Trong file PostDetail.java
    
    @Column(name = "item_condition") // Ánh xạ xuống DB thành cột item_condition
    String condition;
    String usedDuration;
    String reasonForSelling;

    @OneToOne
    @JoinColumn(name = "post_id", unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Posts post;
}
