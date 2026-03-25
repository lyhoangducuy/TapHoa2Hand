package vn.edu.husc.taphoa2hand_backend.validator;

import java.lang.annotation.Target;

import jakarta.validation.Constraint;

import static java.lang.annotation.ElementType.FIELD;
import java.lang.annotation.Retention;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target({FIELD })
@Retention(RUNTIME)
@Constraint(validatedBy = {DobValidator.class  })
public @interface DobConstraint {
    String message() default "Ngày sinh không hợp lệ";
    int min();
    Class<?>[] groups() default {};
    Class<?>[] payload() default {};
}
