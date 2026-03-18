package vn.edu.husc.taphoa2hand_backend.exception;

import javax.print.attribute.standard.MediaSize.NA;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCAGORIZED_EXCEPTION(9999, "Uncategorized error"),
    VALID_EXCEPTION(8888, "Uncategorized error"),
    USER_EXISTS(1001, "Username already exists"),
    EMAIL_EXISTS(1002, "Email already exists"),
    USER_BLANK(1003, "Username must not be blank"),
    USER_SIZE(1004, "Username must be between 3 and 50 characters"),
    NAME_BLANK(1005, "Name must not be blank"),
    NAME_SIZE(1006, "Name must be between 3 and 50 characters"),
    EMAIL_BLANK(1007, "Email must not be blank"),
    EMAIL_INVALID(1008, "Email is not valid"),
    PASSWORD_BLANK(1009, "Password must not be blank"),
    PASSWORD_SIZE(1010, "Password must be between 6 and 100 characters"),
    USER_NOT_FOUND(2001, "User not found"),
    INVALID_PASSWORD(2002, "Invalid password")
    ;
    private int code;
    private String message;

}
