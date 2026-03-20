package vn.edu.husc.taphoa2hand_backend.service;

import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.RolesRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.RolesResponse;
import vn.edu.husc.taphoa2hand_backend.mapper.RolesMapper;
import vn.edu.husc.taphoa2hand_backend.repository.PermissionRepository;
import vn.edu.husc.taphoa2hand_backend.repository.RolesRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class RolesService {
    RolesRepository rolesRepository;
    RolesMapper rolesMapper;
    PermissionRepository permissionRepository;
    public RolesResponse create(RolesRequest request){
        var role=rolesMapper.toRoles(request);
        var permissions=permissionRepository.findAllById(request.getPermissions());
        role.setPermissions(new HashSet<>(permissions));
        rolesRepository.save(role);
        return rolesMapper.toRolesResponse(role);
    }
    public List<RolesResponse> getAll() {
        var roles=rolesRepository.findAll();
        return roles.stream().map(rolesMapper::toRolesResponse).toList();
    }
}
