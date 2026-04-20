package vn.edu.husc.taphoa2hand_backend.dto.response.Posts;

public record AiCheckResponseRecord(
        boolean isMatching,        // Đồ thật có khớp với lời khai không?
        String estimatedWearLevel, // Ước tính độ mới (VD: "90%", "Cũ nát")
        String reason,             // Lý do AI đưa ra kết luận này
        String recommendation      // Lời khuyên cho người mua (VD: "Nên hỏi thêm về pin", "Giá hợp lý")
) {
}