package vn.edu.husc.taphoa2hand_backend.dto.response;

import java.time.LocalDate;
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
public class UserResponse {
    String id;
    String fullName;
    String username;
    String phone;
    String email;
    String avatar;
    String address;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Set<RolesResponse> roles;
    LocalDate dob;
}
