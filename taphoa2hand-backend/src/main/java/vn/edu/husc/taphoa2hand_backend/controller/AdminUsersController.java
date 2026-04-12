package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.UserResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.AdminUsers.AdminUsersResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.UsersResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;
import vn.edu.husc.taphoa2hand_backend.service.UsersService;
import org.springframework.data.domain.Sort;

import java.io.IOException;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminUsersController {
    UsersService usersService;

    @GetMapping
    public ApiResponse<Page<AdminUsersResponse>> getUser(
            // Phép thuật ở đây: Mặc định lấy trang 0, 10 item, mới nhất xếp lên đầu
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable
    ) {
        return ApiResponse.<Page<AdminUsersResponse>>builder()
                .message("Lay toan bo user thanh cong")
                .result(usersService.getAllUserAdmin(pageable))
                .build();
    }
    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getMyInfo(@PathVariable("userId") String userId) {
        return ApiResponse.<UserResponse>builder()
            .message("Lay thong tin user thanh cong")
            .result(usersService.getInfo(userId))
            .build();
    }
    
    @PutMapping("/{userId}/update")
    public ApiResponse<UserResponse> updateUser(@PathVariable String userId,@RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message("Update thong tin thanh cong")
                .result(usersService.updateUser(userId, request))
                .build();
    }
    @PostMapping("/{userId}/update-avatar")
    public ApiResponse<UserResponse> updateAvatar(@PathVariable String userId,@RequestParam("file") MultipartFile file) throws IOException {
        var result = usersService.updateAvatarAdmin(userId,file);
        
        return ApiResponse.<UserResponse>builder()
            .message("Update avatar thanh cong")
            .result(result)
            .build();
    }
    @DeleteMapping("/{userId}/delete")
    public ApiResponse<String> deleteUser(@PathVariable("userId") String userId) {
        return  ApiResponse.<String>builder()
                .result(usersService.deleteUser(userId))
                .build();
    }
    @PostMapping("/create")
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreateRequest request){
         return  ApiResponse.<UserResponse>builder()
                .result(usersService.createAdminUser(request))
                .build();
    }
    
}
