package vn.edu.husc.taphoa2hand_backend.validator;

import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import vn.edu.husc.taphoa2hand_backend.dto.request.UserRedisCodeRequest;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.repository.UserRedisCodeRequestRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Component // Đánh dấu đây là 1 Spring Bean
@RequiredArgsConstructor
public class UserValidationHelper {

    private final UsersRepository usersRepository;
    private final UserRedisCodeRequestRepository userRedisCodeRepository;

    public void validateUserNotExists(String username, String email) {
        // Kiểm tra MariaDB
        if (usersRepository.existsByUsername(username)) 
            throw new AppException(ErrorCode.USER_EXISTS);
        if (usersRepository.existsByEmail(email)) 
            throw new AppException(ErrorCode.EMAIL_EXISTS);

        // Kiểm tra Redis
        if (userRedisCodeRepository.existsById(email)) 
            throw new AppException(ErrorCode.EMAIL_PENDING_VERIFICATION);
        if (userRedisCodeRepository.existsByUsername(username)) 
            throw new AppException(ErrorCode.USERNAME_PENDING_VERIFICATION);
    }
}