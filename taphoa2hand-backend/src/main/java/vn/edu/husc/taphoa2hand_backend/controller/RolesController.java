package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.RolesRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.RolesResponse;
import vn.edu.husc.taphoa2hand_backend.service.RolesService;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class RolesController {
    RolesService rolesService;

    @PostMapping("/create")
    public ApiResponse<RolesResponse> create(@RequestBody RolesRequest request) {
        RolesResponse rolesResponse=rolesService.create(request);
        return ApiResponse.<RolesResponse>builder()
            .result(rolesResponse)
            .build();
    }
    @GetMapping("/getAll")
    public ApiResponse<List<RolesResponse>> getAll() {
        List<RolesResponse> roles=rolesService.getAll();
        return ApiResponse.<List<RolesResponse>>builder()
            .result(roles)
            .build();
    }
    
    
}
