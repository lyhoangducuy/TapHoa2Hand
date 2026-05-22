package vn.edu.husc.taphoa2hand_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PenaltyActionEnum {

    NONE(
            "NONE",
            "Không xử phạt"
    ),

    WARNING(
            "WARNING",
            "Cảnh cáo"
    ),

    REMOVE_POST(
            "REMOVE_POST",
            "Gỡ bài đăng"
    ),

    HIDE_POST(
            "HIDE_POST",
            "Ẩn bài đăng"
    ),

    FREEZE_ACCOUNT_24H(
            "FREEZE_ACCOUNT_24H",
            "Khóa tài khoản 24 giờ"
    ),

    FREEZE_ACCOUNT_7D(
            "FREEZE_ACCOUNT_7D",
            "Khóa tài khoản 7 ngày"
    ),

    FREEZE_ACCOUNT_30D(
            "FREEZE_ACCOUNT_30D",
            "Khóa tài khoản 30 ngày"
    ),

    PERMANENT_BAN(
            "PERMANENT_BAN",
            "Khóa tài khoản vĩnh viễn"
    ),

    STOP_ALL_TRANSACTIONS(
            "STOP_ALL_TRANSACTIONS",
            "Dừng toàn bộ giao dịch"
    ),

    REFUND_BUYER(
            "REFUND_BUYER",
            "Hoàn tiền cho người mua"
    ),

    REFUND_REPORTER(
            "REFUND_REPORTER",
            "Hoàn tiền cho người tố cáo"
    );

    private final String name;
    private final String displayName;
}