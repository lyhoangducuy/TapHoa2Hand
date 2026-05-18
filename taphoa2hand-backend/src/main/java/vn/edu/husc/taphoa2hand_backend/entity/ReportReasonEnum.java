package vn.edu.husc.taphoa2hand_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ReportReasonEnum {
    INAPPROPRIATE_CONTENT("INAPPROPRIATE_CONTENT", "Nội dung không phù hợp"),
    SPAM("SPAM", "Quảng cáo rác"),
    FRAUD("FRAUD", "Lừa đảo"),
    HARASSMENT("HARASSMENT", "Quấy rối"),
    OTHER("OTHER", "Khác");
    private String name;
    private String displayName;
}
