package vn.edu.husc.taphoa2hand_backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum PaymentStatusEnum {
    UNPAID("UNPAID", "Chưa thanh toán"),
    PAID("PAID", "Đã thanh toán"),
    REFUNDED("REFUNDED", "Đã hoàn tiền");

    private final String name;
    private final String displayName;
}
