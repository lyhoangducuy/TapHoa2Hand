package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderResponse;
import vn.edu.husc.taphoa2hand_backend.entity.OrderStatusEnum;
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

    // Lấy đơn hàng mình đi mua
    @GetMapping("/purchases")
    public ApiResponse<List<OrderResponse>> getMyPurchases() {
        return ApiResponse.<List<OrderResponse>>builder()
                .message("Lấy đơn hàng mình đi mua thanh cong")
                .result(orderService.getMyPurchases())
                .build();
    }

    // Lấy đơn hàng mình là người bán
    @GetMapping("/sales")
    public ApiResponse<List<OrderResponse>> getMySales() {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getMySales())
                .message("Lấy đơn hàng mình là người bán thanh cong")
                .build();
    }

    // Lấy chi tiết
    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getById(@PathVariable("orderId") String orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getOrderDetails(orderId))
                .message("Lấy chi tiết thanh cong")
                .build();
    }

    // Cập nhật trạng thái (Dùng PATCH để cập nhật một phần)
    @PatchMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable String id, 
            @RequestParam OrderStatusEnum status) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateStatus(id, status))
                .message("Cập nhật trạng thái thanh cong")
                .build();
    }
}
