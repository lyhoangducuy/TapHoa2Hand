package vn.edu.husc.taphoa2hand_backend.entity;

import org.springframework.data.annotation.Id; // ĐÚNG
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import java.util.concurrent.TimeUnit;
import java.io.Serializable;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("RedisToken")
public class RedisToken implements Serializable {
    @Id
    private String jwtId;

    @TimeToLive(unit = TimeUnit.SECONDS)
    private Long expirationTime;
}