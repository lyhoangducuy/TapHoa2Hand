package vn.edu.husc.taphoa2hand_backend.validator;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target({ TYPE })
@Retention(RUNTIME)
@Constraint(validatedBy = { MiddlemanBankInfoValidator.class })
public @interface MiddlemanBankInfoConstraint {
    String message() default "VALID_EXCEPTION";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
