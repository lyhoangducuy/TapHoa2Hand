package vn.edu.husc.taphoa2hand_backend.service;

import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.UserMapper;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UsersService {
    UsersRepository usersRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    public Users createUser(UserCreateRequest request) {
        if (usersRepository.existsByUsername(request.getUsername())) 
            throw new AppException(ErrorCode.USER_EXISTS);
        if (usersRepository.existsByEmail(request.getEmail())) 
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        Users user=userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return usersRepository.save(user);
    }
    public Set<Users> getUsers() {
        return Set.copyOf(usersRepository.findAll());
    }
    public Users findById(String userId) {
        return usersRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }
    public Users updateUser(String userId, UserUpdateRequest user) {
        Users existingUser = usersRepository.findById(userId).orElseThrow(() 
        -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (existingUser.getUsername().equals(user.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTS);
        if (existingUser.getEmail().equals(user.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        userMapper.updateUser(existingUser, user);
        return usersRepository.save(existingUser);
    }
    public String deleteUser(String userId) {
        Users existingUser = usersRepository.findById(userId).orElseThrow(() 
        -> new AppException(ErrorCode.USER_NOT_FOUND));
        usersRepository.delete(existingUser);
        return "User deleted successfully";
    }
}
