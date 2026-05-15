package vn.edu.husc.taphoa2hand_backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum OrderStatusEnum {
    PENDING("PENDING", "Chờ xác nhận"),
    CONFIRMED("CONFIRMED", "Đã xác nhận, chờ thanh toán"),
    PAID_WAITING_PICKUP("PAID_WAITING_PICKUP", "Đã thanh toán, chờ lấy hàng"),
    SHIPPING("SHIPPING", "Đang giao hàng"),
    DELIVERED("DELIVERED", "Đã giao thành công"),
    CANCELLED("CANCELLED", "Đã hủy"),
    SETTLING("SETTLING", "Đang xử lý giải ngân tiền cho người bán"),
    COMPLETED("COMPLETED", "Hoàn tất, đã chuyển tiền cho người bán"),
    RETURNED("RETURNED", "Trả hàng/Hoàn tiền");

    private final String name;
    private final String displayName;
}
