package vn.edu.husc.taphoa2hand_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCAGORIZED_EXCEPTION(9999, "Uncategorized error",HttpStatus.INTERNAL_SERVER_ERROR),
    VALID_EXCEPTION(8888, "Uncategorized error",HttpStatus.BAD_REQUEST),
    USER_EXISTS(1001, "Username already exists",HttpStatus.BAD_REQUEST),
    EMAIL_EXISTS(1002, "Email already exists",HttpStatus.BAD_REQUEST),
    USER_BLANK(1003, "Username must not be blank",HttpStatus.BAD_REQUEST),
    USER_SIZE(1004, "Username must be between 3 and 50 characters",HttpStatus.BAD_REQUEST),
    NAME_BLANK(1005, "Name must not be blank",HttpStatus.BAD_REQUEST),
    NAME_SIZE(1006, "Name must be between 3 and 50 characters",HttpStatus.BAD_REQUEST),
    EMAIL_BLANK(1007, "Email must not be blank",HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1008, "Email is not valid",HttpStatus.BAD_REQUEST),
    PASSWORD_BLANK(1009, "Password must not be blank",HttpStatus.BAD_REQUEST),
    PASSWORD_SIZE(1010, "Password must be between 6 and 100 characters",HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(2001, "User not found",HttpStatus.NOT_FOUND),
    INVALID_PASSWORD(2002, "Invalid password",HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(2003, "Unauthenticated",HttpStatus.UNAUTHORIZED),
    CANNOT_CREATE_TOKEN(3001, "Cannot create token",HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(3002, "You are not authorized to access this resource",HttpStatus.FORBIDDEN),
    PERMISSION_NOT_FOUND(4001, "Permission not found",HttpStatus.NOT_FOUND),
    INVALID_DOB(4002, "Your age must be at least {min} years old",HttpStatus.BAD_REQUEST),
    CANNOT_CREATE_REFRESH_TOKEN(4003, "Cannot create refresh token",HttpStatus.BAD_REQUEST),
    LOG_OUT_SUCCESS(4004, "Log out successfully",HttpStatus.OK),
    FILE_NOT_FOUND(5001, "File not found",HttpStatus.NOT_FOUND),
    PASSWORD_CONFIRM_NOT_MATCH(5002, "Password and confirm password do not match",HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(5003, "Role not found",HttpStatus.NOT_FOUND)
    ;
    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;

}
