package vn.edu.husc.taphoa2hand_backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum OrderStatusEnum {
    PENDING(1, "Chờ xác nhận"),
    CONFIRMED(2, "Đã xác nhận, chờ lấy hàng"),
    SHIPPING(3, "Đang giao hàng"),
    DELIVERED(4, "Đã giao thành công"),
    CANCELLED(5, "Đã hủy"),
    RETURNED(6, "Trả hàng/Hoàn tiền");

    private final int code;
    private final String message;
}
