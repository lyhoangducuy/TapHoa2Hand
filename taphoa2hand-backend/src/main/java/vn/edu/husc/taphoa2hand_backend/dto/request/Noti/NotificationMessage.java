package vn.edu.husc.taphoa2hand_backend.dto.request.Noti;

import java.util.Map;

import com.google.auto.value.AutoValue.Builder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class NotificationMessage {
    String recipientToken;
    String title;
    String body;
    String image;
    Map<String,String> data;
}
