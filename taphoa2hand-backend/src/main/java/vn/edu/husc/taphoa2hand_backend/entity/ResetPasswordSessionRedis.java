package vn.edu.husc.taphoa2hand_backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("reset_password_session")
public class ResetPasswordSessionRedis {
    @Id
    private String email;

    private String resetToken;

    @TimeToLive
    private Long timeToLive;
}
