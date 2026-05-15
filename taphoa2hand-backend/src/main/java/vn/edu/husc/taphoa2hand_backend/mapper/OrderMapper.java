package vn.edu.husc.taphoa2hand_backend.mapper;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import vn.edu.husc.taphoa2hand_backend.dto.request.Order.OrderRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.BankInfoResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderPostResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.OrderStatusEnumResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Order.PaymentStatusEnumResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PaymentMethodEnumResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.OrderBankInfo;
import vn.edu.husc.taphoa2hand_backend.entity.OrderStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentMethodEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PaymentStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.PostImage;
import vn.edu.husc.taphoa2hand_backend.entity.PostTypeEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.Users;

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
    @Mapping(target = "holdUntil", ignore = true)
    @Mapping(target = "holdDurationUnit", ignore = true)
    @Mapping(target = "holdDurationAmount", ignore = true)
    Order toOrder(OrderRequest dto);

    // Ánh xạ tự động cho InfoBank từ BankInfoDTO
    // OrderBankInfo toOrderBankInfo(OrderRequest.BankInfoDTO dto);

    @Mapping(target = "buyerId", source = "buyer.id") // nhớ check tên field entity
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "status", expression = "java(mapStatus(order.getStatus()))")
    @Mapping(target = "paymentMethod", expression = "java(mapPaymentMethod(order.getPaymentMethod()))")
    @Mapping(target = "paymentStatus", expression = "java(mapPaymentStatus(order.getPaymentStatus()))")
    @Mapping(target = "postId", ignore = true)
    @Mapping(target = "postTitle", ignore = true)
    @Mapping(target = "postImageUrl", ignore = true)
    @Mapping(target = "buyerUsername", ignore = true)
    @Mapping(target = "buyerAvatar", ignore = true)
    @Mapping(target = "sellerUsername", ignore = true)
    @Mapping(target = "sellerAvatar", ignore = true)
    @Mapping(target = "holdDurationUnit", ignore = true)
    OrderResponse toResponse(Order order);

    @AfterMapping
    default void fillPostAndBuyerSummary(Order order, @MappingTarget OrderResponse response) {
        if (order.getBuyer() != null) {
            response.setBuyerUsername(order.getBuyer().getUsername());
            response.setBuyerAvatar(order.getBuyer().getAvatar());
        }
        if (order.getSeller() != null) {
            response.setSellerUsername(order.getSeller().getUsername());
            response.setSellerAvatar(order.getSeller().getAvatar());
        }
        if (order.getHoldDurationUnit() != null) {
            response.setHoldDurationUnit(order.getHoldDurationUnit().name());
        }
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return;
        }
        Posts post = order.getItems().get(0).getPost();
        if (post == null) {
            return;
        }
        response.setPostId(post.getId());
        response.setPostTitle(post.getTitle());
        if (post.getPostImages() != null && !post.getPostImages().isEmpty()) {
            PostImage thumb = post.getPostImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                    .findFirst()
                    .orElse(post.getPostImages().get(0));
            response.setPostImageUrl(thumb.getImageUrl());
        }
    }

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

    /**
     * Tin BÁN: hiển thị người mua đặt đơn. Tin MUA: hiển thị người bán (người nhận đơn).
     */
    default OrderPostResponse toOrderPostResponse(Order order, PostTypeEnum postType) {
        if (order == null) {
            return null;
        }
        Users displayUser = postType == PostTypeEnum.BUY ? order.getSeller() : order.getBuyer();
        var price = order.getItems() != null && !order.getItems().isEmpty()
                ? order.getItems().get(0).getPrice()
                : order.getTotalAmount();
        return OrderPostResponse.builder()
                .orderId(order.getId())
                .username(displayUser != null ? displayUser.getUsername() : null)
                .avatar(displayUser != null ? displayUser.getAvatar() : null)
                .createdAt(order.getCreatedAt())
                .price(price)
                .build();
    }
}