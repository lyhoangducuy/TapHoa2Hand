package vn.edu.husc.taphoa2hand_backend.service;

import java.util.Map;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.config.VNPAYConfig;
import vn.edu.husc.taphoa2hand_backend.dto.response.VNPayResponse;
import vn.edu.husc.taphoa2hand_backend.util.VNPayUtil;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
    
    VNPAYConfig vnPayConfig;

    public VNPayResponse createVnPayPayment(HttpServletRequest request) {
        // Lấy dữ liệu từ query params của request do React gửi lên
        long amount = Integer.parseInt(request.getParameter("amount")) * 100L;
        String bankCode = request.getParameter("bankCode");
        String orderId = request.getParameter("orderId"); // <--- THÊM DÒNG NÀY

        Map<String, String> vnpParamsMap = vnPayConfig.getVNPayConfig();
        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));

        // <--- THÊM 2 DÒNG NÀY ĐỂ VNPAY BIẾT ĐÂY LÀ ĐƠN NÀO --->
        vnpParamsMap.put("vnp_TxnRef", orderId); 
        vnpParamsMap.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);

        if (bankCode != null && !bankCode.isEmpty()) {
            vnpParamsMap.put("vnp_BankCode", bankCode);
        }
        
        vnpParamsMap.put("vnp_IpAddr", VNPayUtil.getIpAddress(request));
        
        // build query url
        String queryUrl = VNPayUtil.getPaymentURL(vnpParamsMap, true);
        String hashData = VNPayUtil.getPaymentURL(vnpParamsMap, false);
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;
        
        return VNPayResponse.builder()
                .code("ok")
                .message("success")
                .paymentUrl(paymentUrl)
                .build();
    }
}