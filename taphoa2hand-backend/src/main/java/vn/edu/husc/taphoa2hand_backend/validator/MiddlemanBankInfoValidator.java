package vn.edu.husc.taphoa2hand_backend.validator;

import java.util.Objects;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderRequest;

public class MiddlemanBankInfoValidator implements ConstraintValidator<MiddlemanBankInfoConstraint, OrderRequest> {

    @Override
    public boolean isValid(OrderRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }

        if (!"MIDDLEMAN".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        boolean validBuyerBank = request.getBuyerBank() != null
                && isFilled(request.getBuyerBank().getBankName())
                && isFilled(request.getBuyerBank().getAccountName())
                && isFilled(request.getBuyerBank().getAccountNumber());

        if (validBuyerBank) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate("VALID_EXCEPTION")
                .addPropertyNode("buyerBank")
                .addConstraintViolation();
        return false;
    }

    private boolean isFilled(String value) {
        return !Objects.isNull(value) && !value.trim().isEmpty();
    }
}
