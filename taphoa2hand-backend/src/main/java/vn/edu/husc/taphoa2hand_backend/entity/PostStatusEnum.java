package vn.edu.husc.taphoa2hand_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PostStatusEnum {
    AVAILABLE("AVAILABLE", "Đang bán"),
    SOLD("SOLD", "Đã bán"),
    HIDDEN("HIDDEN", "Đã ẩn");
    private String name;
    private String displayName;
}
