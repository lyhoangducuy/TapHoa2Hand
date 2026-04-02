package vn.edu.husc.taphoa2hand_backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum PaymentMethodEnum {
    DIRECT("DIRECT", "Trực tiếp"),
    MIDDLEMAN("MIDDLEMAN", "Trung gian");
    private String value;
    private String label;
}
