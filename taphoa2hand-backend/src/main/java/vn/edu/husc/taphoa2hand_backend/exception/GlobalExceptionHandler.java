package vn.edu.husc.taphoa2hand_backend.exception;


import java.util.Map;
import java.util.Objects;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.validation.ConstraintViolation;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final String MIN_ATTRIBUTE = "min";
    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse> handleRuntimeException(RuntimeException e) {
        e.printStackTrace();
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(ErrorCode.UNCAGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCAGORIZED_EXCEPTION.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handleAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity.status(errorCode.getHttpStatusCode())
                                .body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handleAccessDeniedException(AccessDeniedException accessDeniedException) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorCode.getHttpStatusCode())
                                .body(ApiResponse.builder()
                                        .code(errorCode.getCode())
                                        .message(errorCode.getMessage())
                                        .build());
        
    }
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
        String enumString=exception.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.valueOf("VALID_EXCEPTION");
        Map<String,Object> attributes = null;
        try {
            errorCode = ErrorCode.valueOf(enumString);
            var contraintViolation = exception.getBindingResult()
                .getAllErrors().getFirst().unwrap(ConstraintViolation.class);
            attributes = contraintViolation.getConstraintDescriptor().getAttributes();  
        } catch (Exception e) {
            // TODO: handle exception
        }
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(Objects.nonNull(attributes)?
            mapAttribute(errorCode.getMessage(), attributes)
            :errorCode.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }
    private String mapAttribute(String message, Map<String,Object> attributes) {
        String minValue=attributes.get(MIN_ATTRIBUTE).toString();
        return message.replace("{"+MIN_ATTRIBUTE+"}", minValue);
    }
}
