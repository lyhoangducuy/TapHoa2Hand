package vn.edu.husc.taphoa2hand_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "order_bank_info")
public class OrderBankInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String bankName;      // Tên ngân hàng (VD: Vietcombank)

    @Column(nullable = false)
    String accountName;   // Tên chủ tài khoản

    @Column(nullable = false)
    String accountNumber; // Số tài khoản
}