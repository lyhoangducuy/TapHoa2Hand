package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import vn.edu.husc.taphoa2hand_backend.dto.request.RolesRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.RolesResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Roles;

@Mapper(componentModel = "spring")
public interface RolesMapper {
    @Mapping(target = "permissions", ignore = true)
    public Roles toRoles(RolesRequest request);
    public RolesResponse toRolesResponse(Roles role);
}
