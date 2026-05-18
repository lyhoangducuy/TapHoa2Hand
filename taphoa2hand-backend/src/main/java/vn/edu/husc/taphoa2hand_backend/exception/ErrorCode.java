package vn.edu.husc.taphoa2hand_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCAGORIZED_EXCEPTION(9999, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    VALID_EXCEPTION(8888, "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),

    USER_EXISTS(1001, "Tên đăng nhập đã tồn tại", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTS(1002, "Email đã tồn tại", HttpStatus.BAD_REQUEST),
    USER_BLANK(1003, "Tên đăng nhập không được để trống", HttpStatus.BAD_REQUEST),
    USER_SIZE(1004, "Tên đăng nhập phải từ 3 đến 50 ký tự", HttpStatus.BAD_REQUEST),
    NAME_BLANK(1005, "Tên không được để trống", HttpStatus.BAD_REQUEST),
    NAME_SIZE(1006, "Tên phải từ 3 đến 50 ký tự", HttpStatus.BAD_REQUEST),
    EMAIL_BLANK(1007, "Email không được để trống", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1008, "Email không hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_BLANK(1009, "Mật khẩu không được để trống", HttpStatus.BAD_REQUEST),
    PASSWORD_SIZE(1010, "Mật khẩu phải từ 6 đến 100 ký tự", HttpStatus.BAD_REQUEST),

    CANNOT_DELETE_YOURSELF(1011, "Bạn không thể xóa chính mình", HttpStatus.BAD_REQUEST),

    USER_NOT_FOUND(2001, "Không tìm thấy người dùng", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(2002, "Mật khẩu không đúng", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(2003, "Chưa xác thực", HttpStatus.UNAUTHORIZED),

    CANNOT_CREATE_TOKEN(3001, "Không thể tạo token", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(3002, "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),

    PERMISSION_NOT_FOUND(4001, "Không tìm thấy quyền", HttpStatus.NOT_FOUND),
    INVALID_DOB(4002, "Tuổi của bạn phải ít nhất là {min}", HttpStatus.BAD_REQUEST),
    CANNOT_CREATE_REFRESH_TOKEN(4003, "Không thể tạo refresh token", HttpStatus.BAD_REQUEST),
    LOG_OUT_SUCCESS(4004, "Đăng xuất thành công", HttpStatus.OK),

    FILE_NOT_FOUND(5001, "Không tìm thấy tệp", HttpStatus.NOT_FOUND),
    PASSWORD_CONFIRM_NOT_MATCH(5002, "Mật khẩu và xác nhận mật khẩu không khớp", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(5003, "Không tìm thấy vai trò", HttpStatus.NOT_FOUND),
    CODE_NOT_FOUND(5004, "Không tìm thấy mã", HttpStatus.NOT_FOUND),
    OTP_INVALID(5005, "OTP không hợp lệ", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(5006, "OTP đã hết hạn", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED_OR_NOT_FOUND(5007, "OTP đã hết hạn hoặc không tồn tại", HttpStatus.BAD_REQUEST),
    EMAIL_PENDING_VERIFICATION(5008, "Email đang chờ xác thực", HttpStatus.BAD_REQUEST),
    USERNAME_PENDING_VERIFICATION(5009, "Tên đăng nhập đang chờ xác thực", HttpStatus.BAD_REQUEST),
    REGISTER_SESSION_EXPIRED(5010, "Phiên đăng ký đã hết hạn", HttpStatus.BAD_REQUEST),
    OTP_RESEND_TOO_FREQUENTLY(5011, "Gửi lại OTP quá thường xuyên. Vui lòng chờ trước khi yêu cầu OTP mới",
            HttpStatus.BAD_REQUEST),

    POST_NOT_FOUND(6001, "Không tìm thấy bài viết", HttpStatus.NOT_FOUND),

    CATEGORY_EXISTS(7001, "Danh mục đã tồn tại", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(7002, "Không tìm thấy danh mục", HttpStatus.NOT_FOUND),
    POST_CANNOT_DELETE(7003, "Không thể xóa bài viết vì đang liên kết với tài nguyên khác", HttpStatus.BAD_REQUEST),
    INVALID_POST_TYPE(7004, "Loại bài viết không hợp lệ", HttpStatus.BAD_REQUEST),

    FAVORITE_NOT_FOUND(8001, "Không tìm thấy mục yêu thích", HttpStatus.NOT_FOUND),

    CONVERSATION_EXIST(9001, "Cuộc trò chuyện đã tồn tại", HttpStatus.BAD_REQUEST),
    THIS_IS_YOU(9002, "Đây là bài viết của bạn, không thể tạo cuộc trò chuyện", HttpStatus.BAD_REQUEST),
    CONVERSATION_NOT_FOUND(9003, "Không tìm thấy cuộc trò chuyện", HttpStatus.BAD_REQUEST),
    POST_HAD_SOLD(9004, "Bài viết đã được bán", HttpStatus.BAD_REQUEST),
    POST_HIDDEN(9005, "Bài viết đã bị ẩn", HttpStatus.BAD_REQUEST),
    POST_ALREADY_SOLD(9006, "Bài viết đã được bán", HttpStatus.BAD_REQUEST),
    ORDER_ALREADY_EXISTS(9007, "Đã có đơn hàng cho bài viết này, không thể tạo đơn hàng mới", HttpStatus.BAD_REQUEST),

    BANNER_NOT_FOUND(10001, "Không tìm thấy banner", HttpStatus.NOT_FOUND),
    BANNER_EXISTS(10002, "Banner đã tồn tại", HttpStatus.BAD_REQUEST),
    SAVE_FILE_ERRROR(10003, "Lưu tệp thất bại", HttpStatus.BAD_REQUEST),
    ID_USER_NOT_FOUND(10004, "Không tìm thấy ID người dùng", HttpStatus.BAD_REQUEST),
    SELLER_NOT_FOUND(10005, "Không tìm thấy người bán", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_LIMIT_EXCEEDED(10006, "Chỉ được tải lên tối đa 10 ảnh", HttpStatus.BAD_REQUEST),

    FEEDBACK_NOT_FOUND(11001, "Không tìm thấy đánh giá", HttpStatus.NOT_FOUND),
    FEEDBACK_ALREADY_EXISTS(11002, "Đánh giá cho đơn hàng này đã tồn tại", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND(11003, "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    INVALID_ORDER_STATUS(11004, "Trạng thái đơn hàng không hợp lệ để đánh giá", HttpStatus.BAD_REQUEST),

    INVALID_PAYMENT_METHOD(12001, "Phương thức thanh toán không hợp lệ", HttpStatus.BAD_REQUEST),

    REPORT_NOT_FOUND(13001, "Không tìm thấy báo cáo", HttpStatus.NOT_FOUND),
    REPORT_CANNOT_SELF(13002, "Không thể báo cáo chính mình", HttpStatus.BAD_REQUEST),
    REPORT_ORDER_FORBIDDEN(13003, "Chỉ có thể báo cáo đơn hàng mà bạn tham gia (mua hoặc bán)", HttpStatus.FORBIDDEN),
    REPORT_OWN_POST(13004, "Không thể báo cáo bài viết của chính bạn", HttpStatus.BAD_REQUEST),
    REPORT_ORDER_EXISTED(13005, "Đơn hàng đã có báo cáo", HttpStatus.BAD_REQUEST),
    CAPTCHA_REQUIRED(
            2004,
            "Vui lòng xác minh captcha",
            HttpStatus.BAD_REQUEST),

    CAPTCHA_INVALID(
            2005,
            "Captcha không hợp lệ",
            HttpStatus.BAD_REQUEST),
            ;

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}