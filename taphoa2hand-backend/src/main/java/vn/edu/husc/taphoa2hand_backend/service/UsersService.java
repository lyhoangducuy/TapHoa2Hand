package vn.edu.husc.taphoa2hand_backend.service;

import java.io.File;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.UserResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.AdminUsers.AdminUsersResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Roles;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.UserMapper;
import vn.edu.husc.taphoa2hand_backend.repository.RolesRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UsersService {
    UsersRepository usersRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RolesRepository rolesRepository;
    FileService fileService;

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        Users user = usersRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);

    }

    public UserResponse createUser(UserCreateRequest request) {
        if (usersRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTS);
        if (usersRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        Users user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        var roles = rolesRepository.findById("USER");
        Set<Roles> userRoles = new HashSet<>();
        userRoles.add(roles.get());
        user.setRoles(userRoles);
        return userMapper.toUserResponse(usersRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Set<Users> getAllUsers() {
        return Set.copyOf(usersRepository.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Page<AdminUsersResponse> getAllUserAdmin(Pageable pageable) {
        // 1. Gọi hàm findAll có sẵn, truyền pageable vào
        Page<Users> pageUsers = usersRepository.findAll(pageable);

        // 2. Map dữ liệu từ Entity sang DTO (Response)
        return pageUsers.map(userMapper::toAdminUsersResponse);
    }

    @PostAuthorize("returnObject.username == authentication.name or hasRole('ADMIN')")
    public Users findById(String userId) {
        return usersRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        Users existingUser = usersRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!existingUser.getUsername().equals(request.getUsername()) &&
                usersRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTS);
        }
        if (!existingUser.getEmail().equals(request.getEmail()) &&
                usersRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }
        userMapper.updateUser(existingUser, request);
        return userMapper.toUserResponse(usersRepository.save(existingUser));
    }

    public String deleteUser(String userId) {
        // 1. Lấy thông tin user đang thực hiện request (người đang đăng nhập)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        // 2. Tìm user cần xóa dưới DB
        Users existingUser = usersRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 3. CHẶN XÓA CHÍNH MÌNH: Nếu username trùng
        if (existingUser.getUsername().equals(currentUsername)) {
            throw new AppException(ErrorCode.CANNOT_DELETE_YOURSELF);
        }

        // ---------------- THAY ĐỔI Ở ĐÂY ----------------
        // 4. XÓA MỀM (Soft Delete): Thay vì xóa thật, chỉ đổi trạng thái thành false
        existingUser.setActive(false);

        // (Tùy chọn) Thực tế người ta hay sửa lại email/username để mốt người dùng này
        // có thể dùng lại email cũ để đăng ký nick mới. Ví dụ:
        // existingUser.setEmail("deleted_" + System.currentTimeMillis() + "_" +
        // existingUser.getEmail());
        // existingUser.setUsername("deleted_" + System.currentTimeMillis() + "_" +
        // existingUser.getUsername());

        // 5. Lưu xuống Database
        usersRepository.save(existingUser);
        // ------------------------------------------------

        return "User deleted successfully (Soft Delete)";
    }

    public UserResponse updateAvatar(MultipartFile file) throws IOException {
        var user = SecurityContextHolder.getContext().getAuthentication();
        String username = user.getName();

        var existingUser = usersRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var storedFile = fileService.uploadMedia(file);

        existingUser.setAvatar(storedFile.getUrl());
        usersRepository.save(existingUser);
        return userMapper.toUserResponse(existingUser);
    }

    public UserResponse updateAvatarAdmin(String userId, MultipartFile file) throws IOException {

        var existingUser = usersRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var storedFile = fileService.uploadMedia(file);

        existingUser.setAvatar(storedFile.getUrl());
        usersRepository.save(existingUser);
        return userMapper.toUserResponse(existingUser);
    }

    public UserResponse getInfo(String userId) {
        Users user = usersRepository.findById(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    public UserResponse createAdminUser(UserCreateRequest request) {
        if (usersRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTS);
        if (usersRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        Users user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        var roles = rolesRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));
        return userMapper.toUserResponse(usersRepository.save(user));
    }

    // =====================================================
    // BLOCK / UNBLOCK USER
    // =====================================================

    /**
     * Block a user (Admin only).
     * Updates blockedUntil, blockReason, blockedBy.
     * Invalidates all active sessions via passwordChangedAt.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public String blockUser(String userId, String reason) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminUsername = auth != null ? auth.getName() : "SYSTEM";

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Không cho admin block chính mình
        if (user.getUsername().equals(adminUsername)) {
            throw new AppException(ErrorCode.CANNOT_DELETE_YOURSELF);
        }

        // Nếu đã bị block rồi thì bỏ qua
        if (user.getBlockedUntil() != null && user.getBlockedUntil().isAfter(java.time.LocalDateTime.now())) {
            return "User '" + user.getUsername() + "' is already blocked.";
        }

        // Cập nhật trạng thái block vĩnh viễn
        user.setBlockedUntil(java.time.LocalDateTime.now().plusYears(100));
        user.setBlockReason(reason != null ? reason : "Vi phạm điều khoản sử dụng");
        user.setBlockedBy(adminUsername);
        usersRepository.save(user);

        // Invalidate TẤT CẢ token bằng cách đổi passwordChangedAt
        // verifyToken() sẽ tự động reject mọi token cũ vì đã đổi pass
        user.setPasswordChangedAt(java.time.LocalDateTime.now().plusSeconds(1));
        usersRepository.save(user);

        System.out.println("[ADMIN BLOCK] Admin '" + adminUsername + "' blocked user '" + user.getUsername()
                + "' (id=" + userId + "). Reason: " + reason
                + ". All active sessions invalidated.");

        return "User '" + user.getUsername() + "' has been blocked successfully. All active sessions revoked.";
    }

    /**
     * Unblock a user (Admin only).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public String unblockUser(String userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getBlockedUntil() == null
                || !user.getBlockedUntil().isAfter(java.time.LocalDateTime.now())) {
            return "User '" + user.getUsername() + "' is not blocked.";
        }

        user.setBlockedUntil(null);
        user.setBlockReason(null);
        user.setBlockedBy(null);
        usersRepository.save(user);

        System.out.println("[ADMIN UNBLOCK] User '" + user.getUsername() + "' (id=" + userId
                + ") unblocked. User can now login normally.");

        return "User '" + user.getUsername() + "' has been unblocked successfully.";
    }
}
