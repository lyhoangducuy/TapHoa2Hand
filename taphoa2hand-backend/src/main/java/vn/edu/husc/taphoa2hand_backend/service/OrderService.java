package vn.edu.husc.taphoa2hand_backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.OrderItem;
import vn.edu.husc.taphoa2hand_backend.entity.OrderStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.OrderMapper;
import vn.edu.husc.taphoa2hand_backend.repository.OrderRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostsRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
     OrderRepository orderRepository;
    UsersRepository usersRepository;
    PostsRepository postsRepository;
    OrderMapper orderMapper; // Inject Mapper vào đây
    private String getUserStringId(){
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        Users user = usersRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        return user.getId();

    }
    @Transactional
    public OrderResponse createOrder(OrderRequest dto) {
        
        String buyerId=getUserStringId();
        // 1. Lấy dữ liệu từ DB (Bắt buộc phải lấy để đảm bảo bảo mật và quan hệ JPA)
        Users buyer = usersRepository.findById(buyerId).orElseThrow();
        Users seller = usersRepository.findById(dto.getSellerId()).orElseThrow();
        Posts post = postsRepository.findById(dto.getPostId()).orElseThrow();

        // 2. Dùng Mapper để biến DTO thành Entity
        Order order = orderMapper.toEntity(dto);

        // 3. Gán các quan hệ và logic tính toán (Phần Mapper không làm được hoặc khó làm)
        order.setBuyer(buyer);
        order.setSeller(seller);

        // Tính phí sàn 2% nếu chọn MIDDLEMAN
        BigDecimal productPrice = post.getPrice();
        BigDecimal platformFee = BigDecimal.ZERO;
        
        if (dto.getMethod() == PaymentMethodEnum.MIDDLEMAN) {
            platformFee = productPrice.multiply(new BigDecimal("0.02"));
        }
        
        order.setPlatformFee(platformFee);
        order.setTotalAmount(productPrice.add(platformFee));

        // 4. Tạo OrderItem
        OrderItem item = OrderItem.builder()
                .order(order)
                .post(post)
                .price(productPrice)
                .quantity(1)
                .build();
        order.setItems(List.of(item));

        order=orderRepository.save(order);
        return orderMapper.toResponse(order);
    }
    // 2. READ: Danh sách đơn hàng đã mua (Dành cho Người mua)
    public List<OrderResponse> getMyPurchases() {
        Users buyer = usersRepository.findById(getUserStringId()).orElseThrow();
        return orderRepository.findByBuyerOrderByCreatedAtDesc(buyer)
                .stream().map(orderMapper::toResponse).toList();
    }

    // 3. READ: Danh sách đơn hàng khách đặt (Dành cho Người bán)
    public List<OrderResponse> getMySales() {
        Users seller = usersRepository.findById(getUserStringId()).orElseThrow();
        return orderRepository.findByBuyerOrderByCreatedAtDesc(seller)
                .stream().map(orderMapper::toResponse).toList();
    }

    // 4. READ: Chi tiết 1 đơn hàng
    public OrderResponse getOrderDetails(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        return orderMapper.toResponse(order);
    }

    // 5. UPDATE: Cập nhật trạng thái đơn hàng (Logic quan trọng)
    @Transactional
    public OrderResponse updateStatus(String orderId, OrderStatusEnum newStatus) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        
        // Logic: Nếu chuyển sang DELIVERED (Trung gian), thiết lập ngày giải ngân
        if (newStatus == OrderStatusEnum.DELIVERED && 
            order.getPaymentMethod() == PaymentMethodEnum.MIDDLEMAN) {
            order.setHoldUntil(LocalDateTime.now().plusDays(3)); 
        }

        // Logic: Nếu người bán bấm xác nhận trực tiếp -> Ẩn bài viết (Ghim)
        // Bạn có thể gọi PostsService.updateStatus(HIDDEN) ở đây.

        order.setStatus(newStatus);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // 6. DELETE (Logical): Hủy đơn hàng
    @Transactional
    public void cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatusEnum.CANCELLED);
        orderRepository.save(order);
    }
}
