package vn.edu.husc.taphoa2hand_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PostType {
    SELL("SELL", "Tin rao bán"),
    BUY("BUY", "Tin cần mua");
    
    private final String code;
    private final String displayName;
}