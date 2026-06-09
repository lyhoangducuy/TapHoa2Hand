package vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class BlockUserRequest {
    String reason;
}
