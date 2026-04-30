package vn.edu.husc.taphoa2hand_backend.dto.response.Order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderStatusEnumResponse {
    String name;
    String displayName;
}
