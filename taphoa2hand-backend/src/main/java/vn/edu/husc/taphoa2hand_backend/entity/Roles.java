package vn.edu.husc.taphoa2hand_backend.entity;

import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Table(name = "roles")
public class Roles {
    @Id
    String name;
    String description;
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
    name = "roles_permissions",
    joinColumns = @JoinColumn(name = "role_name"), // Chỉ lấy cột name làm khóa ngoại
    inverseJoinColumns = @JoinColumn(name = "permission_name") // Chỉ lấy name của Permission
    )
    Set<Permissions> permissions; // Một Role có nhiều quyền
}
