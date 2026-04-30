package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

@Repository
public interface OrderRepository extends JpaRepository<Order,String>{
    
    // Danh sách đơn hàng đã mua (Buyer)
    Page<Order> findByBuyerOrderByCreatedAtDesc(Users buyer, Pageable pageable);
    
    // Danh sách đơn hàng khách đặt (Seller)
    Page<Order> findBySellerOrderByCreatedAtDesc(Users seller, Pageable pageable);
    
    // Lấy tất cả đơn hàng của buyer (không phân trang)
    List<Order> findByBuyer(Users buyer);
    
    // Lấy tất cả đơn hàng của seller (không phân trang)
    List<Order> findBySeller(Users seller);
}
