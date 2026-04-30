    package vn.edu.husc.taphoa2hand_backend.entity;

    import java.util.List;

    import jakarta.persistence.CascadeType;
    import jakarta.persistence.CollectionTable;
    import jakarta.persistence.Column;
    import jakarta.persistence.ElementCollection;
    import jakarta.persistence.Entity;
    import jakarta.persistence.GeneratedValue;
    import jakarta.persistence.GenerationType;
    import jakarta.persistence.Id;
    import jakarta.persistence.JoinColumn;
    import jakarta.persistence.JoinTable;
    import jakarta.persistence.ManyToMany;
    import jakarta.persistence.OneToMany;
    import jakarta.persistence.Table;
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
    @Table(name = "conversation")
    public class Conversation extends BaseEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        String id;

        String type;
        String participantsHash; // Hash của danh sách participants để dễ dàng tìm kiếm
        String postId;
        @ElementCollection
        @CollectionTable(
            name = "conversation_participants", 
            joinColumns = @JoinColumn(name = "conversation_id")
        )
        List<ParticipantInfo> participants; // Danh sách participants với thông tin chi tiết

    }
