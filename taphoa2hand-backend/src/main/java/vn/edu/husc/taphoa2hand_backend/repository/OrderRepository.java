package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.OrderStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

@Repository
public interface OrderRepository extends JpaRepository<Order,String>{
    
    // Danh sách đơn hàng đã mua (Buyer)
    Page<Order> findByBuyerOrderByCreatedAtDesc(Users buyer, Pageable pageable);
    
    // Danh sách đơn hàng đã mua lọc theo trạng thái
    Page<Order> findByBuyerAndStatusOrderByCreatedAtDesc(Users buyer, OrderStatusEnum status, Pageable pageable);
    
    // Danh sách đơn hàng khách đặt (Seller)
    Page<Order> findBySellerOrderByCreatedAtDesc(Users seller, Pageable pageable);

    // Danh sách đơn hàng khách đặt (Seller) lọc theo trạng thái
    Page<Order> findBySellerAndStatusOrderByCreatedAtDesc(Users seller, OrderStatusEnum status, Pageable pageable);
    
    // Danh sách đơn hàng đã mua lọc theo phương thức thanh toán
    Page<Order> findByBuyerAndPaymentMethodOrderByCreatedAtDesc(Users buyer, PaymentMethodEnum paymentMethod, Pageable pageable);
    
    // Danh sách đơn hàng khách đặt lọc theo phương thức thanh toán
    Page<Order> findBySellerAndPaymentMethodOrderByCreatedAtDesc(Users seller, PaymentMethodEnum paymentMethod, Pageable pageable);
    
    // Danh sách đơn hàng đã mua lọc theo cả trạng thái và phương thức thanh toán
    Page<Order> findByBuyerAndStatusAndPaymentMethodOrderByCreatedAtDesc(Users buyer, OrderStatusEnum status, PaymentMethodEnum paymentMethod, Pageable pageable);
    
    // Danh sách đơn hàng khách đặt lọc theo cả trạng thái và phương thức thanh toán
    Page<Order> findBySellerAndStatusAndPaymentMethodOrderByCreatedAtDesc(Users seller, OrderStatusEnum status, PaymentMethodEnum paymentMethod, Pageable pageable);
    
    // Lấy tất cả đơn hàng của buyer (không phân trang)
    List<Order> findByBuyer(Users buyer);
    
    // Lấy tất cả đơn hàng của seller (không phân trang)
    List<Order> findBySeller(Users seller);
    
    // Kiểm tra xem có đơn hàng active nào cho post này từ buyer này không
    @Query("SELECT o FROM Order o JOIN o.items oi WHERE oi.post.id = :postId AND o.buyer.id = :buyerId AND o.status != OrderStatusEnum.CANCELLED ")
    Optional<Order> findActiveOrderByPostAndBuyer(@Param("postId") String postId, @Param("buyerId") String buyerId);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.post.id = :postId AND o.status = :status AND o.id <> :excludeOrderId")
    List<Order> findByPostIdAndStatusExcludingOrderId(
            @Param("postId") String postId,
            @Param("status") OrderStatusEnum status,
            @Param("excludeOrderId") String excludeOrderId);

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o JOIN o.items i WHERE i.post.id = :postId AND o.status IN :statuses")
    boolean existsByPostIdAndStatusIn(@Param("postId") String postId, @Param("statuses") Collection<OrderStatusEnum> statuses);

}
