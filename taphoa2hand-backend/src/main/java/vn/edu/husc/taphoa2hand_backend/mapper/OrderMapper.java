package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.BankInfoResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderStatusEnumResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.PaymentStatusEnumResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PaymentMethodEnumResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.OrderBankInfo;
import vn.edu.husc.taphoa2hand_backend.entity.OrderStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentStatusEnum;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "buyer", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    // @Mapping(target = "paymentStatus", constant = "UNPAID")
    @Mapping(target = "buyerBankInfo", source = "buyerBank")
    @Mapping(target = "sellerBankInfo", source = "sellerBank")
    @Mapping(target = "paymentMethod", ignore = true) // Bỏ ánh xạ tự động cho paymentMethod
    Order toOrder(OrderRequest dto);

    // Ánh xạ tự động cho InfoBank từ BankInfoDTO
    // OrderBankInfo toOrderBankInfo(OrderRequest.BankInfoDTO dto);

    @Mapping(target = "buyerId", source = "buyer.id") // nhớ check tên field entity
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "status", expression = "java(mapStatus(order.getStatus()))")
    @Mapping(target = "paymentMethod", expression = "java(mapPaymentMethod(order.getPaymentMethod()))")
    @Mapping(target = "paymentStatus", expression = "java(mapPaymentStatus(order.getPaymentStatus()))")
    OrderResponse toResponse(Order order);

    OrderBankInfo toOrderBankInfo(OrderRequest.BankInfoDTO dto);
    BankInfoResponse orderBankInfoToBankInfoResponse(OrderBankInfo bankInfo);

    // ================= ENUM → RESPONSE =================

    default OrderStatusEnumResponse mapStatus(OrderStatusEnum status) {
        if (status == null) return null;

        return OrderStatusEnumResponse.builder()
                .name(status.name())
                .displayName(status.getDisplayName()) // phải có trong enum
                .build();
    }

    default PaymentMethodEnumResponse mapPaymentMethod(PaymentMethodEnum method) {
        if (method == null) return null;

        return PaymentMethodEnumResponse.builder()
                .name(method.name())
                .description(method.getDescription()) // phải có trong enum
                .build();
    }

    default PaymentStatusEnumResponse mapPaymentStatus(PaymentStatusEnum status) {
        if (status == null) return null;

        return PaymentStatusEnumResponse.builder()
                .name(status.name())
                .displayName(status.getDisplayName()) // phải có trong enum
                .build();
    }
}