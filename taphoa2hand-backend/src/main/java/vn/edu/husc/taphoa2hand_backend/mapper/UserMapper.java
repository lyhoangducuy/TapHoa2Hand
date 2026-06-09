package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.UserResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.AdminUsers.AdminUsersResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.UsersResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "roles", ignore = true)
    Users toUser(UserCreateRequest request);
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "posts", ignore = true)
    @Mapping(target = "avatar", ignore = true)
    void updateUser( @MappingTarget Users user,UserUpdateRequest request);
    UserResponse toUserResponse(Users user);

    UsersResponse toUsersResponse(Users user);
    UsersResponse toUsersResponse(String userId);

    @Mapping(target = "blocked", expression = "java(user.getBlockedUntil() != null && user.getBlockedUntil().isAfter(java.time.LocalDateTime.now()))")
    AdminUsersResponse toAdminUsersResponse(Users user);
    
}
