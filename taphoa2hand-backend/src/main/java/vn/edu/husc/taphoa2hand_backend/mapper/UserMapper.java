package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

@Mapper(componentModel = "spring")
public interface UserMapper {
    Users toUser(UserCreateRequest request);
    void updateUser( @MappingTarget Users user,UserUpdateRequest request);
}
