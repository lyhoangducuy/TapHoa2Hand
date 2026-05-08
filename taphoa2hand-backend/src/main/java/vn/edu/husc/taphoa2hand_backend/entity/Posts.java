package vn.edu.husc.taphoa2hand_backend.entity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.Where;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Where(clause = "active = true && status != 'HIDDEN'") // Lọc bỏ các bài viết có trạng thái DELETED và không active
public class Posts extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
     @NotBlank(message = "Tiêu đề không được để trống") // Đã sửa message
    @Size(min = 5, max = 200, message = "Tiêu đề phải có độ dài từ 5 đến 200 ký tự") // Đã sửa message
    String title;
    @NotNull(message="Giá không được để trống")
    @DecimalMin(value = "0", message = "Giá phải lớn hơn hoặc bằng 0")
    BigDecimal price;
    @ElementCollection(targetClass = PaymentMethodEnum.class)
    @CollectionTable(name = "post_payment_methods", joinColumns = @JoinColumn(name = "post_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    @NotEmpty(message = "Phương thức thanh toán không được để trống")
    @Size(min = 1, message = "Phải có ít nhất một phương thức thanh toán")
    List<PaymentMethodEnum> acceptedPaymentMethods;
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    PostStatusEnum status;
    @ManyToOne
    @JoinColumn(name = "user_id")
    Users user;
    @Builder.Default
    boolean active = true;
    @OneToOne(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    PostDetail postDetail;

    @OneToOne(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    PostAddress postAddress;

     @Enumerated(EnumType.STRING)
    @Column(name = "post_type")
    PostTypeEnum postType;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Size(min = 1, message = "Bài viết phải có ít nhất một hình ảnh")
    @Size(max = 10, message = "Bài viết chỉ được có tối đa 10 hình ảnh")
    List<PostImage> postImages;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "posts_category", 
        joinColumns = @JoinColumn(name = "post_id"), 
        inverseJoinColumns = @JoinColumn(name = "category_id"))
    @Size(min = 1, message = "Bài viết phải thuộc ít nhất một danh mục")
    private Set<Categories> categories;
}
