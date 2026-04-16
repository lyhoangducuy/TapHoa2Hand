package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,String> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
}
