package vn.edu.husc.taphoa2hand_backend.entity;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ReportTypeEnum {
    USER("USER", "Người dùng"),
    ORDER("ORDER", "Đơn hàng"),
    POST("POST", "Bài đăng");
    private String name;
    private String displayName;
}
