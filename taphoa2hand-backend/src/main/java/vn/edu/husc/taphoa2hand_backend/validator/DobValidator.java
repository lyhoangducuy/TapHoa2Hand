package vn.edu.husc.taphoa2hand_backend.validator;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DobValidator implements ConstraintValidator<DobConstraint,LocalDate>{
    private int min;

    @Override
    public boolean isValid(LocalDate arg0, ConstraintValidatorContext arg1) {
        if (Objects.isNull(arg0)) 
            return true;
        Long year=ChronoUnit.YEARS.between(arg0, LocalDate.now());
        return year>=min;
    }
    @Override
    public void initialize(DobConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        min=constraintAnnotation.min();
    }

}
