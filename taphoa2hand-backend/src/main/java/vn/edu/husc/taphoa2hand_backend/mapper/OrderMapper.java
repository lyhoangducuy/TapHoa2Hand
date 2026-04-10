package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.OrderBankInfo;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "buyer", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "paymentStatus", constant = "UNPAID")
    @Mapping(target = "buyerBankInfo", source = "buyerBank")
    @Mapping(target = "sellerBankInfo", source = "sellerBank")
    @Mapping(target = "paymentMethod", source = "method")
    Order toEntity(OrderRequest dto);

    // Ánh xạ tự động cho InfoBank từ BankInfoDTO
    OrderBankInfo toOrderBankInfo(OrderRequest.BankInfoDTO dto);
    OrderResponse toResponse(Order order);
}