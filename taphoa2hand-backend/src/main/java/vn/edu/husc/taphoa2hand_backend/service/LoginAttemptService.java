package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private final StringRedisTemplate redisTemplate;

    private static final int MAX_FAIL = 3;

    private static final Duration EXPIRE =
            Duration.ofMinutes(15);

    private String getKey(String username) {
        return "login_fail:" + username;
    }

    public void loginFailed(String username) {

        String key = getKey(username);

        Long count =
                redisTemplate.opsForValue()
                        .increment(key);

        redisTemplate.expire(key, EXPIRE);
    }

    public void loginSuccess(String username) {

        redisTemplate.delete(getKey(username));
    }

    public boolean requireCaptcha(String username) {

        String value =
                redisTemplate.opsForValue()
                        .get(getKey(username));

        if (value == null) {
            return false;
        }

        return Integer.parseInt(value)
                >= MAX_FAIL;
    }

    public int getFailCount(String username) {

        String value =
                redisTemplate.opsForValue()
                        .get(getKey(username));

        return value == null
                ? 0
                : Integer.parseInt(value);
    }
}