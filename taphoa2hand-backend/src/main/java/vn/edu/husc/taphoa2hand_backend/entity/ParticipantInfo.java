package vn.edu.husc.taphoa2hand_backend.entity;

import java.time.Instant;
import java.time.LocalDateTime;

import org.springframework.cglib.core.Local;
import org.springframework.data.annotation.CreatedDate;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class ParticipantInfo {
    @Column(name = "user_id")
    String userId;
    String username;
    @Column(name = "full_name")
    String fullName;
    String avatar;
    @Column(name = "joined_at")
    @Builder.Default
    Instant joinedAt=Instant.now();

}
