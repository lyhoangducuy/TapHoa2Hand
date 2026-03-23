package vn.edu.husc.taphoa2hand_backend.entity;

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
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Builder
public class PostAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String city;
    String district;
    String ward;
    String street;
    Double latitude;
    Double longitude;

    @OneToOne
    @JoinColumn(name = "post_id", unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Posts post;
}
