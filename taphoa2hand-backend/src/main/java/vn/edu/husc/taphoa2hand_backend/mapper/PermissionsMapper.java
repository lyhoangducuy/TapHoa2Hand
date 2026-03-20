package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;

import vn.edu.husc.taphoa2hand_backend.dto.request.PermissionsRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.PermissionsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Permissions;

@Mapper(componentModel = "spring")
public interface PermissionsMapper {
    Permissions toPermissions(PermissionsRequest request);
    PermissionsResponse toPermissionsResponse(Permissions permissions);
}
