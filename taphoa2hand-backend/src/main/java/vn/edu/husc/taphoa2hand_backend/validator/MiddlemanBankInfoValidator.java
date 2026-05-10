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

        boolean validSellerBank = request.getSellerBank() != null
                && isFilled(request.getSellerBank().getBankName())
                && isFilled(request.getSellerBank().getAccountName())
                && isFilled(request.getSellerBank().getAccountNumber());

        if (validBuyerBank && validSellerBank) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        if (!validBuyerBank) {
            context.buildConstraintViolationWithTemplate("VALID_EXCEPTION")
                    .addPropertyNode("buyerBank")
                    .addConstraintViolation();
        }
        if (!validSellerBank) {
            context.buildConstraintViolationWithTemplate("VALID_EXCEPTION")
                    .addPropertyNode("sellerBank")
                    .addConstraintViolation();
        }
        return false;
    }

    private boolean isFilled(String value) {
        return !Objects.isNull(value) && !value.trim().isEmpty();
    }
}
