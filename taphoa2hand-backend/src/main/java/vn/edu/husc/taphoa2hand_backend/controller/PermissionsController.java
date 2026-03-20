package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.PermissionsRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.PermissionsResponse;
import vn.edu.husc.taphoa2hand_backend.service.PermissionsService;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PermissionsController {
    PermissionsService permissionsService;
    @PostMapping("/create")
    ApiResponse<PermissionsResponse> createPermission(@RequestBody PermissionsRequest request) {
        return ApiResponse.<PermissionsResponse>builder()
            .result(permissionsService.create(request))
            .build();

    }
    @GetMapping("/getAll")
    public ApiResponse<List<PermissionsResponse>> getAll() {
        return ApiResponse.<List<PermissionsResponse>>builder()
            .result(permissionsService.getAll())
            .build();
    }
    @DeleteMapping("/delete/{id}")
    public ApiResponse<Boolean> deletePermission(@PathVariable String id) {
        boolean isDeleted=false;
        try {
            permissionsService.deleteById(id);
            isDeleted=true;
        } catch (Exception e) {
            
        }
        return ApiResponse.<Boolean>builder()
            .result(isDeleted)
            .build();
    }
}