package vn.edu.husc.taphoa2hand_backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "orders")
public class Order extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id")
    Users buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    Users seller;

    // --- THÔNG TIN NGÂN HÀNG (MỚI) ---
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "buyer_bank_info_id")
    OrderBankInfo buyerBankInfo; // Dùng để hoàn tiền nếu có sự cố

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "seller_bank_info_id")
    
    OrderBankInfo sellerBankInfo; // Dùng để Admin giải ngân tiền bán hàng

    @Enumerated(EnumType.STRING)
   
    PaymentMethodEnum paymentMethod;

    @Enumerated(EnumType.STRING)
   
    OrderStatusEnum status;

    @Enumerated(EnumType.STRING)
    PaymentStatusEnum paymentStatus;

    BigDecimal totalAmount;
    BigDecimal platformFee;

    @NotBlank(message = "Ten nguoi nhan khong duoc de trong")
    String receiverName;
    @NotBlank(message = "So dien thoai nguoi nhan")
    String receiverPhone;
    @NotBlank(message = "Dia chi nguoi nhan")
    String shippingAddress;
    LocalDateTime holdUntil;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    List<OrderItem> items = new ArrayList<>();
}