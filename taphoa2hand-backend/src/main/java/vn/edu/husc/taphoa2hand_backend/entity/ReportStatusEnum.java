package vn.edu.husc.taphoa2hand_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ReportStatusEnum {
    PENDING("PENDING", "Đang chờ xử lý"),
    APPROVED("APPROVED", "Đã duyệt, đang xử lý"),
    PROCESSED("PROCESSED", "Đã xử lý"),
    REJECTED("REJECTED", "Bị từ chối");
    private String name;
    private String displayName;

}
