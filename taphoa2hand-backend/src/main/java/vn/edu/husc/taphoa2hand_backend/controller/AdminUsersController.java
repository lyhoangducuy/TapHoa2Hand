package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.UserResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.UsersResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;
import vn.edu.husc.taphoa2hand_backend.service.UsersService;

import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminUsersController {
    UsersService usersService;
    @GetMapping("/users")
    public ApiResponse<Set<Users>> getUser() {
        return ApiResponse.<Set<Users>>builder()
                .message("Lay toan bo user thanh cong")
                .result(usersService.getAllUsers())
                .build();
    }
    
}
