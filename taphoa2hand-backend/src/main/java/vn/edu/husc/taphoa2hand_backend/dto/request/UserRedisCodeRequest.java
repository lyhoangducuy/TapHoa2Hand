package vn.edu.husc.taphoa2hand_backend.dto.request;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.validator.DobConstraint;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@RedisHash("UserRedisCodeRequest")
public class UserRedisCodeRequest implements Serializable {
    @NotBlank(message = "NAME_BLANK")
    @Size(min = 3, max = 50, message = "NAME_SIZE")
    String fullName;
    @Indexed
    @NotBlank(message = "USER_BLANK")
    @Size(min = 3, max = 50, message = "USER_SIZE")
    String username;
    @Id
    @NotBlank(message = "EMAIL_BLANK")
    @Email(message = "EMAIL_INVALID")
    String email;
    String password;
    @NotBlank(message = "PASSWORD_BLANK")
    @Size(min = 6, max = 100, message = "PASSWORD_SIZE")
    String confirmPassword;
    String phone;
    @DobConstraint(min = 15, message = "INVALID_DOB")
    LocalDate dob;
    String code;
    @TimeToLive 
    Long timeToLive;
    long lastSentTime;
    
}
