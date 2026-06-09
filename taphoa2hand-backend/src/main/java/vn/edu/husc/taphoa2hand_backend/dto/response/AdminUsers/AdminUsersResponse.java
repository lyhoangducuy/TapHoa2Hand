package vn.edu.husc.taphoa2hand_backend.dto.response.AdminUsers;

import java.time.LocalDateTime;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.Roles;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AdminUsersResponse {
    String id;
    String username;
    Set<Roles> roles;

    // Block info
    boolean blocked;
    LocalDateTime blockedUntil;
    String blockReason;
    String blockedBy;
}
