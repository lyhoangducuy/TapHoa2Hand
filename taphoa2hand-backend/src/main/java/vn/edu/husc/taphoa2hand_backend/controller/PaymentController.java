package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.PaymentResponse;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;

import java.util.Arrays;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    @GetMapping("/getAll")
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        List<PaymentResponse> result = Arrays.stream(PaymentMethodEnum.values())
                .map(method -> PaymentResponse.builder()
                        .value(method.name())
                        .label(method.getLabel())
                        .build())
                .toList();

        return ApiResponse.<List<PaymentResponse>>builder()
                .message("Lấy danh sách phương thức thanh toán thành công")
                .result(result)
                .build();
    }
}
