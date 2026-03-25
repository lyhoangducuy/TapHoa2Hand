package vn.edu.husc.taphoa2hand_backend.entity;


import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Email {
    @NotBlank(message = "Email address must not be blank")
    String toEmail;
    @NotBlank(message = "Subject must not be blank")
    String subject;
    @NotBlank(message = "Body must not be blank")
    String body;
}
