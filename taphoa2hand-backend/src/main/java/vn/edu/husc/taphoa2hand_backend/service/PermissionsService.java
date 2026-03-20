package vn.edu.husc.taphoa2hand_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.PermissionsRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.PermissionsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Permissions;
import vn.edu.husc.taphoa2hand_backend.mapper.PermissionsMapper;
import vn.edu.husc.taphoa2hand_backend.repository.PermissionRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PermissionsService {
    PermissionRepository permissionRepository;
    PermissionsMapper permissionsMapper;
    public PermissionsResponse create(PermissionsRequest request) {
        Permissions permissions = permissionsMapper.toPermissions(request);
        permissions = permissionRepository.save(permissions);
        return permissionsMapper.toPermissionsResponse(permissions);
    }
    public List<PermissionsResponse> getAll(){
        var permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionsMapper::toPermissionsResponse).toList();
    }
    public void deleteById(String id) {
        permissionRepository.deleteById(id);;
    }
}
