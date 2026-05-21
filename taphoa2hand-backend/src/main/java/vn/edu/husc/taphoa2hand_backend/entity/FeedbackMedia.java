package vn.edu.husc.taphoa2hand_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "feedback_media")
@Getter
@Setter
public class FeedbackMedia extends BaseEntity {

    String url;

    String contentType;

    long size;

    @Enumerated(EnumType.STRING)
    MediaType type; // IMAGE / VIDEO

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id")
    Feedback feedback;
}