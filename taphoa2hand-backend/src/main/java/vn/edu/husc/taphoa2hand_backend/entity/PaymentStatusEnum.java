package vn.edu.husc.taphoa2hand_backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum PaymentStatusEnum {
    UNPAID(1, "Chưa thanh toán"),
    PAID(2, "Đã thanh toán"),
    REFUNDED(3, "Đã hoàn tiền");

    private final int code;
    private final String message;
}
