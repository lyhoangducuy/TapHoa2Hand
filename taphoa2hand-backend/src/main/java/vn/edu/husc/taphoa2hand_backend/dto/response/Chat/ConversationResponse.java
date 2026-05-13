package vn.edu.husc.taphoa2hand_backend.dto.response.Chat;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.ParticipantInfo;
import vn.edu.husc.taphoa2hand_backend.entity.PostImage;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ConversationResponse {
    String id;
    String type;
    String participantsHash;
    String conversationAvatar;
    String conversationName;
    List<ParticipantInfo> participants;
    String postId;
    String postTitle; // Tên sản phẩm
    String postImage; // Ảnh thu nhỏ
    BigDecimal postPrice; // Giá
    /** SELL = tin rao bán, BUY = tin cần mua (người tạo đơn có thể nhập giá đề xuất). */
    String postType;
    String postStatus; // Trạng thái sản phẩm (AVAILABLE, SOLD, HIDDEN, etc.)
    Boolean isMyPost;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
