package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nimbusds.jose.JOSEException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.LogoutRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.RefreshRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.UserRedisCodeRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.VerifyCodeRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.AuthenticationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.IntrospectRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.RegisterRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.AuthenticationResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.IntrospectResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.RegisterResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.ResultCodeResponse;
import vn.edu.husc.taphoa2hand_backend.service.AuthenticationService;

import java.text.ParseException;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody @Valid AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/register")
    public ApiResponse<RegisterResponse> register(@RequestBody @Valid RegisterRequest request) {
        var result = authenticationService.register(request);
        return ApiResponse.<RegisterResponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody  IntrospectRequest request) throws JOSEException, ParseException {
        IntrospectResponse result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        System.out.println("===== ENTER LOGOUT =====");
        authenticationService.logout(request);
        System.out.println("===== END LOGOUT =====");
        return ApiResponse.<Void>builder()
                .build();

    }
    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refreshToken(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/send-code")
    public ApiResponse<RegisterResponse> sendCode(@RequestBody VerifyCodeRequest request) {
        RegisterResponse result = authenticationService.verifyOtpAndSaveUser(request.getEmail(), request.getCode());
        return ApiResponse.<RegisterResponse>builder()
                .result( result)
                .build();
    }
    @PostMapping("/re-send-code")
    public ApiResponse<RegisterResponse> reSendCode(@RequestBody @Valid UserRedisCodeRequest request) {
        RegisterResponse result = authenticationService.resendOtp(request.getEmail());
        return ApiResponse.<RegisterResponse>builder()
                .result( result)
                .build();
    }
    
    
    
    
}
