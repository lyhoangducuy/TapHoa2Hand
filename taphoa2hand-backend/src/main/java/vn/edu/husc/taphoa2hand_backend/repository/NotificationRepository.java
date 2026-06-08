package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,String> {
    List<Notification> findByUserIds_IdOrderByCreatedAtDesc(String userId);
    Long countByUserIds_IdAndIsRead(String userId, boolean isRead);

    @Query("""
        select distinct n
        from Notification n
        left join fetch n.userIds
        where n.createdBy is not null
    """)
    Page<Notification> findAllWithCreatedBy(Pageable pageable);

    @Query("""
        select distinct n
        from Notification n
        left join fetch n.userIds
        where n.createdBy is not null
    """)
    List<Notification> findAllWithCreatedByList();
}
