package vn.edu.husc.taphoa2hand_backend.controller;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderUpdateStatusRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderResponse;
import vn.edu.husc.taphoa2hand_backend.service.OrderService;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;

    // Tạo mới
    @PostMapping
    public ApiResponse<OrderResponse> create(@RequestBody @Valid OrderRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .message("Tao order thanh cong")
                .result(orderService.createOrder(request))
                .build();
    }

    // Lấy đơn hàng mình đi mua (phân trang)
    @GetMapping("/purchases")
    public ApiResponse<Page<OrderResponse>> getMyPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
            , @RequestParam(required = false) String status
    ) {
        return ApiResponse.<Page<OrderResponse>>builder()
                .message("Lấy đơn hàng mình đi mua thanh cong")
                .result(orderService.getPurchase(page, size, status))
                .build();
    }

    // Lấy đơn hàng mình là người bán (phân trang)
    @GetMapping("/sales")
    public ApiResponse<Page<OrderResponse>> getMySales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
            , @RequestParam(required = false) String status
    ) {
        return ApiResponse.<Page<OrderResponse>>builder()
                .message("Lấy đơn hàng mình là người bán thanh cong")
                .result(orderService.getSales(page, size, status))
                .build();
    }

    // Lấy tất cả đơn hàng cho admin (phân trang)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ApiResponse<Page<OrderResponse>> getAllOrders(Pageable pageable) {
        return ApiResponse.<Page<OrderResponse>>builder()
                .message("Lấy tất cả đơn hàng thành công")
                .result(orderService.getAllOrders(pageable))
                .build();
    }

    // Lấy chi tiết
    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getById(@PathVariable("id") String orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getOrderDetails(orderId))
                .message("Lấy chi tiết thanh cong")
                .build();
    }

    // Cập nhật trạng thái (Dùng PATCH để cập nhật một phần)
    @PatchMapping("/{orderId}/status")
    public ApiResponse<OrderResponse> updateStatusDetail(
            @PathVariable String orderId,
            @RequestParam String newStatus) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateStatus(orderId, newStatus))
                .message("Cập nhật trạng thái thanh cong")
                .build();
    }
    @PostMapping("/update")
    public ApiResponse<OrderResponse> postMethodUpdate(@RequestBody OrderUpdateStatusRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateStatus(request.getOrderId(), request.getNewStatus()))
                .message("Cập nhật trạng thái thanh cong")
                .build();
    }
    
}
