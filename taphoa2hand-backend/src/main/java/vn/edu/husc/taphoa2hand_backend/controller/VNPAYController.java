package vn.edu.husc.taphoa2hand_backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.VNPayResponse;
import vn.edu.husc.taphoa2hand_backend.service.PaymentService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

    @RestController
    @RequestMapping("/payment")
    @RequiredArgsConstructor
    public class VNPAYController {
        private final PaymentService paymentService;

        @GetMapping("/vn-pay")
        public ApiResponse<VNPayResponse> pay(HttpServletRequest request) {
            return ApiResponse.<VNPayResponse>builder()
                    .result(paymentService.createVnPayPayment(request))
                    .build();
        }

        @GetMapping("/vn-pay-callback")
        public ApiResponse<VNPayResponse> payCallbackHandler(HttpServletRequest request) {
            String status = request.getParameter("vnp_ResponseCode");
            if (status.equals("00")) {
                return ApiResponse.<VNPayResponse>builder()
                        .message("Success")
                        .result(VNPayResponse.builder()
                                .code("00")
                                .message("Success")
                                .paymentUrl("")
                                .build())
                        .build();
            } else {
                return ApiResponse.<VNPayResponse>builder()
                        .message("Failed")
                        .build();
            }
        }
    }
