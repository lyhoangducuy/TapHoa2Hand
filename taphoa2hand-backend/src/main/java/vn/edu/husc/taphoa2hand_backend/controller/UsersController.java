package vn.edu.husc.taphoa2hand_backend.controller;

import java.util.Set;

import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.service.UsersService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;




@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UsersController {
    UsersService usersService;
    @PostMapping("/create")
    public ApiResponse<Users> createUser(@RequestBody @Valid UserCreateRequest request) {
        ApiResponse<Users> apiResponse = new ApiResponse<>();
        apiResponse.setResult(usersService.createUser(request));
        return apiResponse;
    }
    @GetMapping("/getAllUsers")
    public Set<Users> getMethodName() {
        return usersService.getUsers();
    }
    @GetMapping("/{userId}")
    public Users getUser(@PathVariable("userId") String userId) {
        return usersService.findById(userId);
    }
    @PutMapping("/{userId}")
    public Users updateUser(@PathVariable("userId") String userId, @RequestBody UserUpdateRequest request) {
        return usersService.updateUser(userId, request);
    }
    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable("userId") String userId) {
       
        return  usersService.deleteUser(userId);
    }
    
}
