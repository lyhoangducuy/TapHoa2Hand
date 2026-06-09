package vn.edu.husc.taphoa2hand_backend.config;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.AuthenticationEntryPoint;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;

public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;
        int httpStatus = errorCode.getHttpStatusCode().value();

        // Nếu là JwtException (bao gồm cả "Tài khoản đã bị khóa"), trả đúng message
        if (authException instanceof JwtException jwtEx) {
            String msg = jwtEx.getMessage();
            if (msg != null && msg.contains("khóa")) {
                errorCode = ErrorCode.USER_BLOCKED;
            } else if (msg != null && msg.contains("Token đã bị vô hiệu")) {
                errorCode = ErrorCode.UNAUTHENTICATED;
            }
            httpStatus = errorCode.getHttpStatusCode().value();
        }

        response.setStatus(httpStatus);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        ObjectMapper objectMapper = new ObjectMapper();
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        response.flushBuffer();
    }
}
