package vn.edu.husc.taphoa2hand_backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.AdminUsers.AdminUsersResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Conversation;
import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.OrderItem;
import vn.edu.husc.taphoa2hand_backend.entity.OrderStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.ParticipantInfo;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.OrderMapper;
import vn.edu.husc.taphoa2hand_backend.repository.ConversationRepository;
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
    OrderMapper orderMapper; // Inject Mapper vào đây\
    ConversationRepository conversationRepository;
    NotificationService notificationService;

    private String getUserStringId() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        Users user = usersRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        return user.getId();

    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // 1. Lấy dữ liệu từ DB (Bắt buộc phải lấy để đảm bảo bảo mật và quan hệ JPA)
        Users buyer = usersRepository.findByUsername(request.getBuyerId().trim())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
       // 2. LẤY SELLER TỪ CONVERSATION ID
    // Giả sử request.getSellerId() thực tế đang chứa Conversation ID
    String conversationId = request.getSellerId(); 
    
    Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

    // Tìm Participant nào có userId khác với ID của người mua
    ParticipantInfo sellerInfo = conversation.getParticipants().stream()
            .filter(p -> !p.getUserId().equals(buyer.getId()))
            .findFirst()
            .orElseThrow(() -> new AppException(ErrorCode.SELLER_NOT_FOUND));

    // 3. Lấy thực thể Users của Seller từ DB
    Users seller = usersRepository.findById(sellerInfo.getUserId())
            .orElseThrow(() -> new AppException(ErrorCode.ID_USER_NOT_FOUND));
        Posts post = postsRepository.findById(request.getPostId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (post.getStatus().equals(PostStatusEnum.HIDDEN))
            throw new AppException(ErrorCode.POST_HIDDEN);
        if (post.getStatus().equals(PostStatusEnum.SOLD))
            throw new AppException(ErrorCode.POST_HAD_SOLD);
        
        // Kiểm tra xem đã có đơn hàng active cho bài viết này từ người mua này chưa
        orderRepository.findActiveOrderByPostAndBuyer(request.getPostId(), buyer.getId())
                .ifPresent(existingOrder -> {
                    throw new AppException(ErrorCode.ORDER_ALREADY_EXISTS);
                });
        
        if (request.getMethod() != null && request.getMethod().equalsIgnoreCase("MIDDLEMAN")) {
            if (request.getBuyerBank() == null || request.getSellerBank() == null
                    || request.getBuyerBank().getBankName() == null || request.getBuyerBank().getBankName().trim().isEmpty()
                    || request.getBuyerBank().getAccountName() == null || request.getBuyerBank().getAccountName().trim().isEmpty()
                    || request.getBuyerBank().getAccountNumber() == null || request.getBuyerBank().getAccountNumber().trim().isEmpty()
                    || request.getSellerBank().getBankName() == null || request.getSellerBank().getBankName().trim().isEmpty()
                    || request.getSellerBank().getAccountName() == null || request.getSellerBank().getAccountName().trim().isEmpty()
                    || request.getSellerBank().getAccountNumber() == null || request.getSellerBank().getAccountNumber().trim().isEmpty()) {
                throw new AppException(ErrorCode.VALID_EXCEPTION);
            }
        }

        // 2. Dùng Mapper để biến DTO thành Entity
        Order order = orderMapper.toOrder(request);

        // 3. Gán các quan hệ và logic tính toán (Phần Mapper không làm được hoặc khó
        // làm)
        order.setBuyer(buyer);
        order.setSeller(seller);
        order.setPaymentMethod(PaymentMethodEnum.valueOf(request.getMethod()));

        // Tính phí sàn 2% nếu chọn MIDDLEMAN
        BigDecimal productPrice = post.getPrice();
        BigDecimal platformFee = BigDecimal.ZERO;

        // if (request.getMethod() == PaymentMethodEnum.MIDDLEMAN) {
        // platformFee = productPrice.multiply(new BigDecimal("0.02"));
        // }
        // order.setPaymentMethod(request.getMethod());
        order.setPlatformFee(platformFee);
        order.setTotalAmount(productPrice.add(platformFee));

        // // 4. Tạo OrderItem
        OrderItem item = OrderItem.builder()
                .order(order)
                .post(post)
                .price(post.getPrice())
                .quantity(1)
                .build();
        order.setItems(List.of(item));


        order = orderRepository.save(order);
        String orderLink = "/order/myOrder/" + order.getId();
        notificationService.createNotification(NotificationRequest.builder()
                .content("Bạn có một đơn hàng mới từ " + buyer.getUsername())
                .userIds(List.of(seller.getId()))
                .link(orderLink)
                .build());
        
        return orderMapper.toResponse(order);
    }

    // 2. READ: Danh sách đơn hàng đã mua (Dành cho Người mua)
    public Page<OrderResponse> getPurchase(Pageable pageable) {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        Users buyer = usersRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        Page<Order> orders = orderRepository.findByBuyerOrderByCreatedAtDesc(buyer, pageable);
        return orders.map(orderMapper::toResponse);
    }

    public Page<OrderResponse> getPurchase(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return getPurchase(pageable);
    }

    // New: hỗ trợ lọc theo trạng thái
    public Page<OrderResponse> getPurchase(Pageable pageable, OrderStatusEnum status) {
        if (status == null) return getPurchase(pageable);
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        Users buyer = usersRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        Page<Order> orders = orderRepository.findByBuyerAndStatusOrderByCreatedAtDesc(buyer, status, pageable);
        return orders.map(orderMapper::toResponse);
    }

    public Page<OrderResponse> getPurchase(int page, int size, String statusStr) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        OrderStatusEnum status = null;
        if (statusStr != null && !statusStr.isBlank()) status = OrderStatusEnum.valueOf(statusStr);
        return getPurchase(pageable, status);
    }

    // 3. READ: Danh sách đơn hàng khách đặt (Dành cho Người bán)
    public Page<OrderResponse> getSales(Pageable pageable) {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        Users seller = usersRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        Page<Order> orders = orderRepository.findBySellerOrderByCreatedAtDesc(seller, pageable);
        return orders.map(orderMapper::toResponse);
    }

    public Page<OrderResponse> getSales(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return getSales(pageable);
    }

    // New: hỗ trợ lọc theo trạng thái cho sales
    public Page<OrderResponse> getSales(Pageable pageable, OrderStatusEnum status) {
        if (status == null) return getSales(pageable);
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        Users seller = usersRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        Page<Order> orders = orderRepository.findBySellerAndStatusOrderByCreatedAtDesc(seller, status, pageable);
        return orders.map(orderMapper::toResponse);
    }

    public Page<OrderResponse> getSales(int page, int size, String statusStr) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        OrderStatusEnum status = null;
        if (statusStr != null && !statusStr.isBlank()) status = OrderStatusEnum.valueOf(statusStr);
        return getSales(pageable, status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(orderMapper::toResponse);
    }

    // 4. READ: Chi tiết 1 đơn hàng
    
   public OrderResponse getOrderDetails(String orderId) {
    Users currentUser = usersRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName())
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

    boolean isBuyer = order.getBuyer().getId().equals(currentUser.getId());
    boolean isSeller = order.getSeller().getId().equals(currentUser.getId());
    boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

    if (!isBuyer && !isSeller && !isAdmin) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    return orderMapper.toResponse(order);
}
    // 5. UPDATE: Cập nhật trạng thái đơn hàng (Logic quan trọng)
    @Transactional
    public OrderResponse updateStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        OrderStatusEnum newStatus= OrderStatusEnum.valueOf(status);
        // Logic: Nếu chuyển sang DELIVERED (Trung gian), thiết lập ngày giải ngân
        if (newStatus == OrderStatusEnum.DELIVERED &&
                order.getPaymentMethod() == PaymentMethodEnum.MIDDLEMAN) {
            order.setHoldUntil(LocalDateTime.now().plusDays(3));
        }

        // Logic: Khi người bán xác nhận đơn -> Cập nhật bài viết thành SOLD
        if (newStatus == OrderStatusEnum.CONFIRMED) {
            // Lấy post từ order items và cập nhật status
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                OrderItem firstItem = order.getItems().get(0);
                Posts post = firstItem.getPost();
                if (post != null) {
                    post.setStatus(PostStatusEnum.SOLD);
                    postsRepository.save(post);
                }
            }
        }

        // Logic: Khi hủy đơn -> Cập nhật bài viết lại thành AVAILABLE (nếu muốn)
        if (newStatus == OrderStatusEnum.CANCELLED) {
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                OrderItem firstItem = order.getItems().get(0);
                Posts post = firstItem.getPost();
                if (post != null) {
                    post.setStatus(PostStatusEnum.AVAILABLE);
                    postsRepository.save(post);
                }
            }
        }

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
