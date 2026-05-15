package vn.edu.husc.taphoa2hand_backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Noti.NotificationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.AdminUsers.AdminUsersResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Conversation;
import vn.edu.husc.taphoa2hand_backend.entity.HoldDurationUnit;
import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.OrderBankInfo;
import vn.edu.husc.taphoa2hand_backend.entity.OrderItem;
import vn.edu.husc.taphoa2hand_backend.entity.OrderStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.ParticipantInfo;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostTypeEnum;
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

    private static final int MAX_ESCROW_HOLD_HOURS = 10 * 24;
    /** Phí trung gian: 2% trên giá hàng (làm tròn VND). Khớp tạm tính trên OrderModal. */
    private static final BigDecimal MIDDLEMAN_PLATFORM_FEE_RATE = new BigDecimal("0.02");

    OrderRepository orderRepository;
    UsersRepository usersRepository;
    PostsRepository postsRepository;
    OrderMapper orderMapper; // Inject Mapper vào đây\
    ConversationRepository conversationRepository;
    NotificationService notificationService;

    private static LocalDateTime addEscrowHold(LocalDateTime from, int amount, HoldDurationUnit unit) {
        if (unit == HoldDurationUnit.DAYS) {
            return from.plusDays(amount);
        }
        return from.plusHours(amount);
    }

    /**
     * Giao dịch trung gian: lưu thời gian giữ tiền ký quỹ (tối đa 10 ngày / 240
     * giờ). Giao dịch trực tiếp: xóa các trường này.
     */
    private void applyEscrowHoldFromRequest(Order order, OrderRequest request) {
        order.setHoldDurationUnit(null);
        order.setHoldDurationAmount(null);
        if (order.getPaymentMethod() != PaymentMethodEnum.MIDDLEMAN) {
            return;
        }
        if (request.getHoldDurationUnit() == null || request.getHoldDurationUnit().isBlank()) {
            throw new AppException(ErrorCode.VALID_EXCEPTION);
        }
        if (request.getHoldDurationAmount() == null || request.getHoldDurationAmount() < 1) {
            throw new AppException(ErrorCode.VALID_EXCEPTION);
        }
        HoldDurationUnit unit;
        try {
            unit = HoldDurationUnit.valueOf(request.getHoldDurationUnit().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new AppException(ErrorCode.VALID_EXCEPTION);
        }
        int amount = request.getHoldDurationAmount();
        int totalHours = unit == HoldDurationUnit.DAYS ? amount * 24 : amount;
        if (totalHours < 1 || totalHours > MAX_ESCROW_HOLD_HOURS) {
            throw new AppException(ErrorCode.VALID_EXCEPTION);
        }
        order.setHoldDurationUnit(unit);
        order.setHoldDurationAmount(amount);
    }

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

        boolean isBuyPost = post.getPostType() == PostTypeEnum.BUY;
        if (isBuyPost) {
            if (request.getOfferedPrice() == null || request.getOfferedPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(ErrorCode.VALID_EXCEPTION);
            }
        } else if (request.getOfferedPrice() != null) {
            throw new AppException(ErrorCode.VALID_EXCEPTION);
        }

        // Kiểm tra xem đã có đơn hàng active cho bài viết này từ người mua này chưa
        orderRepository.findActiveOrderByPostAndBuyer(request.getPostId(), buyer.getId())
                .ifPresent(existingOrder -> {
                    throw new AppException(ErrorCode.ORDER_ALREADY_EXISTS);
                });

        if (request.getMethod() != null && request.getMethod().equalsIgnoreCase("MIDDLEMAN")) {
            if (request.getBuyerBank() == null
                    || request.getBuyerBank().getBankName() == null
                    || request.getBuyerBank().getBankName().trim().isEmpty()
                    || request.getBuyerBank().getAccountName() == null
                    || request.getBuyerBank().getAccountName().trim().isEmpty()
                    || request.getBuyerBank().getAccountNumber() == null
                    || request.getBuyerBank().getAccountNumber().trim().isEmpty()) {
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
        applyEscrowHoldFromRequest(order, request);

        BigDecimal lineItemPrice = isBuyPost ? request.getOfferedPrice() : post.getPrice();

        // Phí nền tảng: chỉ áp dụng trung gian, trên giá hàng (SELL = giá tin; BUY = giá đề xuất)
        BigDecimal platformFee = BigDecimal.ZERO;
        if (order.getPaymentMethod() == PaymentMethodEnum.MIDDLEMAN) {
            platformFee = lineItemPrice.multiply(MIDDLEMAN_PLATFORM_FEE_RATE).setScale(0, RoundingMode.HALF_UP);
        }
        order.setPlatformFee(platformFee);
        order.setTotalAmount(lineItemPrice.add(platformFee));

        // // 4. Tạo OrderItem
        OrderItem item = OrderItem.builder()
                .order(order)
                .post(post)
                .price(lineItemPrice)
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

    private static final List<OrderStatusEnum> POST_WINNER_STATUSES = List.of(
            OrderStatusEnum.CONFIRMED,
            OrderStatusEnum.PAID_WAITING_PICKUP,
            OrderStatusEnum.SHIPPING,
            OrderStatusEnum.DELIVERED);

    private Posts getFirstPostFromOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return null;
        }
        return order.getItems().get(0).getPost();
    }

    /**
     * Khi hủy đơn: chỉ mở bán lại nếu không còn đơn nào ở trạng thái đã chốt
     * (CONFIRMED/SHIPPING/DELIVERED).
     */
    private void refreshPostAfterOrdersChanged(Posts post) {
        if (post == null || post.getStatus() == PostStatusEnum.HIDDEN) {
            return;
        }
        boolean hasWinner = orderRepository.existsByPostIdAndStatusIn(post.getId(), POST_WINNER_STATUSES);
        if (hasWinner) {
            if (post.getStatus() != PostStatusEnum.SOLD) {
                post.setStatus(PostStatusEnum.SOLD);
                postsRepository.save(post);
            }
        } else if (post.getStatus() == PostStatusEnum.SOLD) {
            post.setStatus(PostStatusEnum.AVAILABLE);
            postsRepository.save(post);
        }
    }

    private void assertUserCanSetOrderStatus(Order order, Users currentUser, OrderStatusEnum newStatus,
            boolean isAdmin) {
        String uid = currentUser.getId();
        boolean isSeller = order.getSeller() != null && Objects.equals(order.getSeller().getId(), uid);
        boolean isBuyer = order.getBuyer() != null && Objects.equals(order.getBuyer().getId(), uid);
        if (newStatus == OrderStatusEnum.CONFIRMED) {
            if (!isSeller && !isAdmin) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            if (order.getStatus() != OrderStatusEnum.PENDING) {
                throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
            }
            return;
        }
        if (newStatus == OrderStatusEnum.PAID_WAITING_PICKUP) {
            if (!isBuyer && !isAdmin) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            if (order.getStatus() != OrderStatusEnum.CONFIRMED) {
                throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
            }
            return;
        }
        if (newStatus == OrderStatusEnum.CANCELLED) {
            if (!isSeller && !isBuyer && !isAdmin) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            return;
        }
        if (newStatus == OrderStatusEnum.SHIPPING || newStatus == OrderStatusEnum.DELIVERED) {
            if (!isSeller && !isAdmin) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            // Cho phép chuyển từ CONFIRMED hoặc PAID_WAITING_PICKUP sang SHIPPING
            if (newStatus == OrderStatusEnum.SHIPPING) {
                if (order.getStatus() != OrderStatusEnum.CONFIRMED && order.getStatus() != OrderStatusEnum.PAID_WAITING_PICKUP) {
                    throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
                }
            }
            // Cho phép chuyển từ SHIPPING sang DELIVERED
            if (newStatus == OrderStatusEnum.DELIVERED) {
                if (order.getStatus() != OrderStatusEnum.SHIPPING) {
                    throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
                }
            }
        }
    }

    /**
     * Khi người bán chọn một đơn: hủy mọi đơn PENDING khác cùng tin đăng (không đổi
     * trạng thái bài viết ở bước này).
     */
    private void cancelOtherPendingOrdersForSamePost(Order winningOrder) {
        Posts post = getFirstPostFromOrder(winningOrder);
        if (post == null) {
            return;
        }
        List<Order> others = orderRepository.findByPostIdAndStatusExcludingOrderId(
                post.getId(), OrderStatusEnum.PENDING, winningOrder.getId());
        for (Order other : others) {
            other.setStatus(OrderStatusEnum.CANCELLED);
            orderRepository.save(other);
            Users buyer = other.getBuyer();
            if (buyer != null) {
                String shortId = other.getId() != null && other.getId().length() > 8
                        ? other.getId().substring(0, 8)
                        : other.getId();
                notificationService.createNotification(NotificationRequest.builder()
                        .content("Người bán đã chọn người mua khác. Đơn #" + shortId + " đã hủy.")
                        .userIds(List.of(buyer.getId()))
                        .link("/order/myOrder/" + other.getId())
                        .build());
            }
        }
    }

    // 2. READ: Danh sách đơn hàng đã mua (Dành cho Người mua)
    @Transactional(readOnly = true)
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
        if (status == null)
            return getPurchase(pageable);
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
        if (statusStr != null && !statusStr.isBlank())
            status = OrderStatusEnum.valueOf(statusStr);
        return getPurchase(pageable, status);
    }

    // 3. READ: Danh sách đơn hàng khách đặt (Dành cho Người bán)
    @Transactional(readOnly = true)
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
        if (status == null)
            return getSales(pageable);
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
        if (statusStr != null && !statusStr.isBlank())
            status = OrderStatusEnum.valueOf(statusStr);
        return getSales(pageable, status);
    }

    // New: hỗ trợ lọc theo cả trạng thái và phương thức thanh toán
    @Transactional(readOnly = true)
    public Page<OrderResponse> getPurchase(int page, int size, String statusStr, String paymentStr) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        OrderStatusEnum status = null;
        if (statusStr != null && !statusStr.isBlank())
            status = OrderStatusEnum.valueOf(statusStr);
        PaymentMethodEnum payment = null;
        if (paymentStr != null && !paymentStr.isBlank())
            payment = PaymentMethodEnum.valueOf(paymentStr);

        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        Users buyer = usersRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));

        Page<Order> orders;
        if (status != null && payment != null) {
            orders = orderRepository.findByBuyerAndStatusAndPaymentMethodOrderByCreatedAtDesc(buyer, status, payment,
                    pageable);
        } else if (status != null) {
            orders = orderRepository.findByBuyerAndStatusOrderByCreatedAtDesc(buyer, status, pageable);
        } else if (payment != null) {
            orders = orderRepository.findByBuyerAndPaymentMethodOrderByCreatedAtDesc(buyer, payment, pageable);
        } else {
            orders = orderRepository.findByBuyerOrderByCreatedAtDesc(buyer, pageable);
        }
        return orders.map(orderMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getSales(int page, int size, String statusStr, String paymentStr) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        OrderStatusEnum status = null;
        if (statusStr != null && !statusStr.isBlank())
            status = OrderStatusEnum.valueOf(statusStr);
        PaymentMethodEnum payment = null;
        if (paymentStr != null && !paymentStr.isBlank())
            payment = PaymentMethodEnum.valueOf(paymentStr);

        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        Users seller = usersRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));

        Page<Order> orders;
        if (status != null && payment != null) {
            orders = orderRepository.findBySellerAndStatusAndPaymentMethodOrderByCreatedAtDesc(seller, status, payment,
                    pageable);
        } else if (status != null) {
            orders = orderRepository.findBySellerAndStatusOrderByCreatedAtDesc(seller, status, pageable);
        } else if (payment != null) {
            orders = orderRepository.findBySellerAndPaymentMethodOrderByCreatedAtDesc(seller, payment, pageable);
        } else {
            orders = orderRepository.findBySellerOrderByCreatedAtDesc(seller, pageable);
        }
        return orders.map(orderMapper::toResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(
            Pageable pageable,
            String orderStatusStr,
            String paymentMethodStr,
            String paymentStatusStr) {
        boolean hasFilter = (orderStatusStr != null && !orderStatusStr.isBlank())
                || (paymentMethodStr != null && !paymentMethodStr.isBlank())
                || (paymentStatusStr != null && !paymentStatusStr.isBlank());
        if (!hasFilter) {
            return orderRepository.findAll(pageable).map(orderMapper::toResponse);
        }
        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (orderStatusStr != null && !orderStatusStr.isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("status"), OrderStatusEnum.valueOf(orderStatusStr.trim())));
                } catch (IllegalArgumentException ignored) {
                    // bỏ qua giá trị không hợp lệ
                }
            }
            if (paymentMethodStr != null && !paymentMethodStr.isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("paymentMethod"), PaymentMethodEnum.valueOf(paymentMethodStr.trim())));
                } catch (IllegalArgumentException ignored) {
                }
            }
            if (paymentStatusStr != null && !paymentStatusStr.isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("paymentStatus"), PaymentStatusEnum.valueOf(paymentStatusStr.trim())));
                } catch (IllegalArgumentException ignored) {
                }
            }
            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return orderRepository.findAll(spec, pageable).map(orderMapper::toResponse);
    }

    /**
     * Admin xác nhận đã chuyển tiền cho người bán sau khi hết thời gian giữ ký quỹ (đơn trung gian, đã giao).
     */
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public OrderResponse adminConfirmEscrowPayout(String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getPaymentMethod() != PaymentMethodEnum.MIDDLEMAN) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }
        if (order.getStatus() != OrderStatusEnum.DELIVERED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }
        if (order.getHoldUntil() == null) {
            throw new AppException(ErrorCode.VALID_EXCEPTION);
        }
        if (LocalDateTime.now().isBefore(order.getHoldUntil())) {
            throw new AppException(ErrorCode.VALID_EXCEPTION);
        }
        if (order.getPaymentStatus() == PaymentStatusEnum.PAID) {
            return orderMapper.toResponse(order);
        }
        order.setPaymentStatus(PaymentStatusEnum.PAID);
        Order saved = orderRepository.save(order);
        String orderLink = "/order/myOrder/" + order.getId();
        notificationService.createNotification(NotificationRequest.builder()
                .content("Admin đã xác nhận giải ngân ký quỹ cho đơn hàng #" + order.getId() + ".")
                .userIds(List.of(order.getBuyer().getId(), order.getSeller().getId()))
                .link(orderLink)
                .build());
        return orderMapper.toResponse(saved);
    }

    // 4. READ: Chi tiết 1 đơn hàng

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(String orderId) {
        Users currentUser = usersRepository
                .findByUsername(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

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
        return updateStatus(orderId, status, null);
    }

    @Transactional
    public OrderResponse updateStatus(String orderId, String status, OrderRequest.BankInfoDTO sellerBankInfo) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        OrderStatusEnum newStatus = OrderStatusEnum.valueOf(status);

        Users currentUser = usersRepository.findByUsername(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        assertUserCanSetOrderStatus(order, currentUser, newStatus, isAdmin);

        if (newStatus == OrderStatusEnum.CONFIRMED && order.getPaymentMethod() == PaymentMethodEnum.MIDDLEMAN) {
            if (order.getSellerBankInfo() == null) {
                if (sellerBankInfo == null
                        || sellerBankInfo.getBankName() == null || sellerBankInfo.getBankName().trim().isEmpty()
                        || sellerBankInfo.getAccountName() == null || sellerBankInfo.getAccountName().trim().isEmpty()
                        || sellerBankInfo.getAccountNumber() == null
                        || sellerBankInfo.getAccountNumber().trim().isEmpty()) {
                    throw new AppException(ErrorCode.VALID_EXCEPTION);
                }
                order.setSellerBankInfo(OrderBankInfo.builder()
                        .bankName(sellerBankInfo.getBankName())
                        .accountName(sellerBankInfo.getAccountName())
                        .accountNumber(sellerBankInfo.getAccountNumber())
                        .build());
            }
            
        }

        if (newStatus == OrderStatusEnum.CONFIRMED) {
            cancelOtherPendingOrdersForSamePost(order);
            String orderLink = "/order/myOrder/" + order.getId();
                notificationService.createNotification(NotificationRequest.builder()
                        .content("Don hang " + order.getId() + " da duoc xac nhan boi nguoi ban "
                                + order.getBuyer().getUsername())
                        .userIds(List.of(order.getBuyer().getId()))
                        .link(orderLink)
                        .build());
        }

        // Trung gian: sau giao thành công, thiết lập mốc hết hạn giữ tiền theo thời
        // gian đã chọn khi tạo đơn
        if (newStatus == OrderStatusEnum.DELIVERED &&
                order.getPaymentMethod() == PaymentMethodEnum.MIDDLEMAN) {
            LocalDateTime now = LocalDateTime.now();
            if (order.getHoldDurationUnit() != null && order.getHoldDurationAmount() != null) {
                order.setHoldUntil(addEscrowHold(now, order.getHoldDurationAmount(), order.getHoldDurationUnit()));
            } else {
                order.setHoldUntil(now.plusDays(3));
            }
            String orderLink = "/order/myOrder/" + order.getId();
                notificationService.createNotification(NotificationRequest.builder()
                        .content("Don hang " + order.getId() + " da hoan thanh va duoc xac nhan boi nguoi ban "
                                + order.getBuyer().getUsername())
                        .userIds(List.of(order.getBuyer().getId()))
                        .link(orderLink)
                        .build());

        }

        // Logic: Khi người bán xác nhận đơn -> Cập nhật bài viết thành SOLD
        if (newStatus == OrderStatusEnum.CONFIRMED) {
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                OrderItem firstItem = order.getItems().get(0);
                Posts post = firstItem.getPost();
                if (post != null) {
                    post.setStatus(PostStatusEnum.SOLD);
                    postsRepository.save(post);
                }
                String orderLink = "/order/myOrder/" + order.getId();
                notificationService.createNotification(NotificationRequest.builder()
                        .content("Don hang " + order.getId() + " da duoc xac nhan boi nguoi ban "
                                + order.getBuyer().getUsername())
                        .userIds(List.of(order.getBuyer().getId()))
                        .link(orderLink)
                        .build());

            }
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        if (newStatus == OrderStatusEnum.CANCELLED) {
            refreshPostAfterOrdersChanged(getFirstPostFromOrder(saved));
            String orderLink = "/order/myOrder/" + order.getId();
            notificationService.createNotification(NotificationRequest.builder()
                    .content("Don hang " + order.getId() + " da bi huy bo boi " + order.getBuyer().getUsername())
                    .userIds(List.of(order.getBuyer().getId()))
                    .link(orderLink)
                    .build());
        }
        return orderMapper.toResponse(saved);
    }

    // 6. DELETE (Logical): Hủy đơn hàng
    @Transactional
    public void cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatusEnum.CANCELLED);

        orderRepository.save(order);
    }
    @Transactional
    @Scheduled(cron = "0 0 * * * *")
    public void scanAndProcessOrders() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Tự động hủy đơn PENDING sau 24h
        List<Order> pendingOrders = orderRepository.findByStatus(OrderStatusEnum.PENDING);
        for (Order order : pendingOrders) {
            if (order.getCreatedAt().plusHours(24).isBefore(now)) {
                order.setStatus(OrderStatusEnum.CANCELLED);
                orderRepository.save(order);
                refreshPostAfterOrdersChanged(getFirstPostFromOrder(order));
                
                // Gửi thông báo hủy (tùy chọn)
                sendSystemNotification(order, "Đơn hàng đã tự động hủy do không được xác nhận sau 24h.");
            }
        }

        // 2. Xử lý đơn đã CONFIRMED/SHIPPING để chuyển sang DELIVERED
        // Lấy các đơn chưa hoàn thành
        List<Order> activeOrders = orderRepository.findByStatusIn(List.of(OrderStatusEnum.CONFIRMED, OrderStatusEnum.SHIPPING));
        
        for (Order order : activeOrders) {
            Posts post = getFirstPostFromOrder(order);
            if (post == null) continue;

            if (post.getPostType() == PostTypeEnum.SELL) {
                // Nếu là tin BÁN: Tự động hoàn thành sau 7 ngày kể từ khi xác nhận (Confirmed)
                if (order.getUpdatedAt().plusDays(7).isBefore(now)) {
                    completeOrder(order);
                }
            } 
            else if (post.getPostType() == PostTypeEnum.BUY) {
                // Nếu là tin MUA: Tự động hoàn thành sau 2 ngày kể từ mốc HoldUntil
                // Giả định: Người bán tin MUA giao hàng -> qua ngày giữ tiền -> +2 ngày thì auto confirm
                if (order.getHoldUntil() != null && order.getHoldUntil().plusDays(2).isBefore(now)) {
                    completeOrder(order);
                }
            }
        }
    }

    private void completeOrder(Order order) {
        order.setStatus(OrderStatusEnum.DELIVERED);
        
        // Nếu là trung gian, thiết lập lại mốc hold tiền nếu chưa có (để admin biết khi nào được giải ngân)
        if (order.getPaymentMethod() == PaymentMethodEnum.MIDDLEMAN && order.getHoldUntil() == null) {
            LocalDateTime now = LocalDateTime.now();
            if (order.getHoldDurationUnit() != null && order.getHoldDurationAmount() != null) {
                order.setHoldUntil(addEscrowHold(now, order.getHoldDurationAmount(), order.getHoldDurationUnit()));
            } else {
                order.setHoldUntil(now.plusDays(3));
            }
        }
        
        orderRepository.save(order);
        sendSystemNotification(order, "Đơn hàng #" + order.getId() + " đã được hệ thống xác nhận hoàn thành.");
    }

    private void sendSystemNotification(Order order, String message) {
        notificationService.createNotification(NotificationRequest.builder()
                .content(message)
                .userIds(List.of(order.getBuyer().getId(), order.getSeller().getId()))
                .link("/order/myOrder/" + order.getId())
                .build());
    }

    // 6. Xác nhận thanh toán - chuyển từ CONFIRMED sang PAID_WAITING_PICKUP
    @Transactional
    public OrderResponse confirmPayment(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Users currentUser = usersRepository.findByUsername(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Chỉ người mua mới có thể xác nhận thanh toán
        boolean isBuyer = order.getBuyer() != null && Objects.equals(order.getBuyer().getId(), currentUser.getId());
        if (!isBuyer) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Chỉ có thể xác nhận khi đơn ở trạng thái CONFIRMED (chờ thanh toán)
        if (order.getStatus() != OrderStatusEnum.CONFIRMED) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        // Chuyển sang trạng thái PAID_WAITING_PICKUP
        order.setStatus(OrderStatusEnum.PAID_WAITING_PICKUP);
        Order saved = orderRepository.save(order);

        // Gửi thông báo cho người bán
        String orderLink = "/order/myOrder/" + order.getId();
        notificationService.createNotification(NotificationRequest.builder()
                .content("Người mua đã xác nhận thanh toán cho đơn hàng #" + order.getId() + ". Vui lòng chuẩn bị lấy hàng.")
                .userIds(List.of(order.getSeller().getId()))
                .link(orderLink)
                .build());

        return orderMapper.toResponse(saved);
    }
}
