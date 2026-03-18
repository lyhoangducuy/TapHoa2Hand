package vn.edu.husc.taphoa2hand_backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Họ tên không được để trống") // Đã sửa message
    @Size(min = 3, max = 50, message = "Họ tên phải có độ dài từ 3 đến 50 ký tự") // Đã sửa message
    private String fullName;

    @NotBlank(message = "Username không được để trống")
    @Column(nullable = false, unique = true)
    @Size(min = 3, max = 50, message = "Username phải có độ dài từ 3 đến 50 ký tự")
    private String username;

    private String phone;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    @Column(nullable = false, unique = true)   
    private String email;

    @NotBlank(message = "Password không được để trống")
    @Column(nullable = false)
    @Size(min = 6, max = 100, message = "Password phải có độ dài từ 6 đến 100 ký tự")
    private String password;

    private String avatar;
    private String address;

    @Builder.Default
    private boolean active = true; // Gán mặc định là true

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}