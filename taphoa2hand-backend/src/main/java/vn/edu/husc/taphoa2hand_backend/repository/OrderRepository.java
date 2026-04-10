package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

@Repository
public interface OrderRepository extends JpaRepository<Order,String>{

    Optional<Order> findByBuyerOrderByCreatedAtDesc(Users buyer);
    
}
