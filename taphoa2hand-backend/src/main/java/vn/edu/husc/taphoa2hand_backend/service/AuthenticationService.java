package vn.edu.husc.taphoa2hand_backend.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashSet;
import java.util.Objects;
import java.util.Random;
import java.util.Set;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import vn.edu.husc.taphoa2hand_backend.dto.JwtInfo;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.ResetPasswordRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.LogoutRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.RefreshRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.UserRedisCodeRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.AuthenticationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.IntrospectRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.RegisterRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.AuthenticationResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.IntrospectResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.RegisterResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.VerifyForgotPasswordOtpResponse;
import vn.edu.husc.taphoa2hand_backend.entity.EmailInfo;
import vn.edu.husc.taphoa2hand_backend.entity.ForgotPasswordRedis;
import vn.edu.husc.taphoa2hand_backend.entity.RedisToken;
import vn.edu.husc.taphoa2hand_backend.entity.ResetPasswordSessionRedis;
import vn.edu.husc.taphoa2hand_backend.entity.Roles;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.repository.ForgotPasswordRedisRepository;
import vn.edu.husc.taphoa2hand_backend.repository.RedisTokenRepository;
import vn.edu.husc.taphoa2hand_backend.repository.ResetPasswordSessionRedisRepository;
import vn.edu.husc.taphoa2hand_backend.repository.RolesRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UserRedisCodeRequestRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;
import vn.edu.husc.taphoa2hand_backend.validator.UserValidationHelper;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UsersRepository usersRepository;
    PasswordEncoder passwordEncoder;
    RedisTokenRepository redisTokenRepository;
    RolesRepository rolesRepository;
    EmailService emailService;
    UserRedisCodeRequestRepository userRedisCodeRequestRepository;
    UserValidationHelper userValidationHelper;
    LoginAttemptService loginAttemptService;
    ForgotPasswordRedisRepository forgotPasswordRedisRepository;
    ResetPasswordSessionRedisRepository resetPasswordSessionRedisRepository;
    
    @NonFinal
    @Value("${jwt.signed-key}")
    protected String SIGNER_KEY;
    @NonFinal
    @Value("${jwt.access-token-duration-seconds}")
    protected Integer ACCESS_TOKEN_DURATION_SECONDS;
    @NonFinal
    @Value("${jwt.refresh-token-duration-seconds}")
    protected Integer REFRESH_TOKEN_DURATION_SECONDS;
    @NonFinal
    @Value("${jwt.code-duration-seconds}")
    protected Long CODE_DURATION_SECONDS;
    @NonFinal
    @Value("${forgot-password.max-otp-attempts:5}")
    protected Integer MAX_OTP_ATTEMPTS;
    @NonFinal
    @Value("${forgot-password.resend-cooldown-seconds:60}")
    protected Long RESEND_COOLDOWN_SECONDS;

    @Transactional
    public void forgotPassword(String email) {

        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String otp = generateOTP();

        ForgotPasswordRedis redisData = ForgotPasswordRedis.builder()
                .email(email)
                .otp(otp)
                .failedAttempts(0L)
                .lastSentTime(System.currentTimeMillis())
                .timeToLive(CODE_DURATION_SECONDS)
                .build();

        forgotPasswordRedisRepository.save(redisData);

        emailService.sendEmail(
                EmailInfo.builder()
                        .toEmail(email)
                        .subject("TapHoa2Hand - Khôi phục mật khẩu")
                        .body(
                                "Mã OTP của bạn là: "
                                        + otp
                                        + "\nCó hiệu lực trong 5 phút.")
                        .build());
    }

    /**
     * Verify OTP for forgot password
     * Returns reset token if OTP is valid
     */
    public VerifyForgotPasswordOtpResponse verifyForgotPasswordOtp(String email, String otp) {
        // 1. Find OTP in Redis
        ForgotPasswordRedis redisData = forgotPasswordRedisRepository.findById(email)
                .orElseThrow(() -> new AppException(ErrorCode.OTP_EXPIRED_OR_NOT_FOUND));

        // 2. Check if OTP matches
        if (!redisData.getOtp().equals(otp)) {
            // Increment failed attempts
            Long failedAttempts = redisData.getFailedAttempts() != null ? redisData.getFailedAttempts() + 1 : 1;
            redisData.setFailedAttempts(failedAttempts);
            
            // If too many attempts, delete OTP and throw error
            if (failedAttempts >= MAX_OTP_ATTEMPTS) {
                forgotPasswordRedisRepository.deleteById(email);
                throw new AppException(ErrorCode.OTP_TOO_MANY_ATTEMPTS);
            }
            
            // Save updated failed attempts
            forgotPasswordRedisRepository.save(redisData);
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        // 3. OTP is valid - Generate reset token
        String resetToken = UUID.randomUUID().toString();

        // 4. Save reset token to Redis
        ResetPasswordSessionRedis resetSession = ResetPasswordSessionRedis.builder()
                .email(email)
                .resetToken(resetToken)
                .timeToLive(CODE_DURATION_SECONDS)
                .build();
        resetPasswordSessionRedisRepository.save(resetSession);

        // 5. Delete OTP from Redis
        forgotPasswordRedisRepository.deleteById(email);

        return VerifyForgotPasswordOtpResponse.builder()
                .success(true)
                .message("Xác thực OTP thành công")
                .resetToken(resetToken)
                .build();
    }

    /**
     * Reset password with reset token
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail();
        String resetToken = request.getResetToken();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        // 1. Find reset session in Redis
        ResetPasswordSessionRedis resetSession = resetPasswordSessionRedisRepository.findById(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESET_SESSION_EXPIRED));

        // 2. Verify reset token
        if (!resetSession.getResetToken().equals(resetToken)) {
            throw new AppException(ErrorCode.RESET_TOKEN_INVALID);
        }

        // 3. Check password match
        if (!newPassword.equals(confirmPassword)) {
            throw new AppException(ErrorCode.PASSWORD_CONFIRM_NOT_MATCH);
        }

        // 4. Find user
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 5. Check new password is not same as current
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new AppException(ErrorCode.SAME_PASSWORD_NOT_ALLOWED);
        }

        // 6. Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        usersRepository.save(user);

        // 7. Delete reset session from Redis
        resetPasswordSessionRedisRepository.deleteById(email);

        // 8. Delete OTP if still exists (cleanup)
        forgotPasswordRedisRepository.deleteById(email);
    }

    /**
     * Resend OTP for forgot password
     */
    public void resendForgotPasswordOtp(String email) {
        // 1. Check if OTP still exists in Redis
        ForgotPasswordRedis redisData = forgotPasswordRedisRepository.findById(email)
                .orElseThrow(() -> new AppException(ErrorCode.OTP_EXPIRED_OR_NOT_FOUND));

        // 2. Check cooldown period (60 seconds)
        long currentTime = System.currentTimeMillis();
        long timePassed = currentTime - redisData.getLastSentTime();
        long cooldownMillis = RESEND_COOLDOWN_SECONDS * 1000;

        if (timePassed < cooldownMillis) {
            throw new AppException(ErrorCode.OTP_RESEND_TOO_FREQUENTLY);
        }

        // 3. Generate new OTP
        String newOtp = generateOTP();

        // 4. Update Redis data
        redisData.setOtp(newOtp);
        redisData.setLastSentTime(currentTime);
        redisData.setTimeToLive(CODE_DURATION_SECONDS);
        redisData.setFailedAttempts(0L); // Reset failed attempts on new OTP

        forgotPasswordRedisRepository.save(redisData);

        // 5. Send email
        emailService.sendEmail(
                EmailInfo.builder()
                        .toEmail(email)
                        .subject("TapHoa2Hand - Khôi phục mật khẩu (OTP mới)")
                        .body("Mã OTP mới của bạn là: " + newOtp + "\nCó hiệu lực trong 5 phút.")
                        .build());
    }

    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isVerified = true;
        SignedJWT jwt = null;
        try {
            jwt = verifyToken(token, request.getTokenType());

        } catch (Exception e) {
            isVerified = false;
        }
        return IntrospectResponse.builder()
                .valid(isVerified)
                .userId(Objects.nonNull(jwt)
                        ? jwt.getJWTClaimsSet().getSubject()
                        : null)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = usersRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {

            loginAttemptService.loginFailed(
                    request.getUsername());

            throw new AppException(
                    ErrorCode.INVALID_PASSWORD);
        }
        loginAttemptService.loginSuccess(
                request.getUsername());
        var token = generateToken(user, "ACCESS_TOKEN", ACCESS_TOKEN_DURATION_SECONDS);
        var refreshToken = generateToken(user, "REFRESH_TOKEN", REFRESH_TOKEN_DURATION_SECONDS);
        return AuthenticationResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .authenticated(true)
                .build();
    }

    public String generateOTP() {
        Random random = new Random();
        // Tạo số từ 0 đến 999,999
        int number = random.nextInt(1000000);
        // Format để luôn đủ 6 chữ số (thêm số 0 ở đầu nếu thiếu)
        return String.format("%06d", number);
    }

    public RegisterResponse register(RegisterRequest request) {

        userValidationHelper.validateUserNotExists(request.getUsername(), request.getEmail());
        // 1. Kiểm tra điều kiện đầu vào trước (Fail-fast)
        if (!request.getPassword().equals(request.getConfirmPassword()))
            throw new AppException(ErrorCode.PASSWORD_CONFIRM_NOT_MATCH);

        // 2. Tạo OTP
        String otp = generateOTP();

        // 3. Đóng gói TOÀN BỘ thông tin đăng ký vào Redis
        // Lưu ý: Mã hoá password ngay từ bước này cho an toàn
        UserRedisCodeRequest redisData = UserRedisCodeRequest.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .dob(request.getDob())
                .code(otp)
                // Cấu hình TTL (Thời gian sống) của Redis
                .timeToLive(CODE_DURATION_SECONDS)
                .lastSentTime(System.currentTimeMillis())
                .build();

        userRedisCodeRequestRepository.save(redisData); // Lưu vào Redis

        // 4. Gửi Email
        emailService.sendEmail(EmailInfo.builder()
                .toEmail(request.getEmail())
                .subject("Welcome to TapHoA2Hand - Verify your account")
                .body("Thank you for registering with us! Your OTP code is: " + otp +
                        ". This code will expire in 5 minutes.")
                .build());

        // 5. Trả về thành công (Lúc này User chưa được lưu vào MySQL)
        return RegisterResponse.builder()
                .success(true)
                .build();
    }

    public RegisterResponse resendOtp(String email) {
        // 1. Tìm thông tin trong Redis
        UserRedisCodeRequest redisData = userRedisCodeRequestRepository.findById(email)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTER_SESSION_EXPIRED));

        // 2. KIỂM TRA CHẶN SPAM (RATE LIMITING)
        long currentTime = System.currentTimeMillis();
        long timePassed = currentTime - redisData.getLastSentTime();
        long cooldownPeriod = 60 * 1000; // 60 giây (đổi ra mili-giây)

        if (timePassed < cooldownPeriod) {
            // Nếu gửi lại khi chưa đủ 60 giây -> Chặn và báo lỗi
            throw new AppException(ErrorCode.OTP_RESEND_TOO_FREQUENTLY); // Thông báo: Gửi lại OTP quá nhanh, vui lòng
                                                                         // đợi
        }

        // 3. Nếu đã qua 60 giây -> Tạo mã mới
        String newOtp = generateOTP();

        // 4. Cập nhật lại thông tin vào data cũ
        redisData.setCode(newOtp);
        redisData.setLastSentTime(currentTime); // Reset lại mốc thời gian vừa gửi xong
        redisData.setTimeToLive(CODE_DURATION_SECONDS); // Reset lại đếm ngược 5 phút từ đầu

        // 5. Lưu đè lại vào Redis
        userRedisCodeRequestRepository.save(redisData);

        // 6. Gửi lại Email cho người dùng
        emailService.sendEmail(EmailInfo.builder()
                .toEmail(email)
                .subject("TapHoA2Hand - Your New Verification Code")
                .body("You requested a new verification code. Your new OTP is: " + newOtp +
                        ". This code will expire in 5 minutes.")
                .build());

        return RegisterResponse.builder()
                .success(true)
                .build();
    }

    @Transactional
    public RegisterResponse verifyOtpAndSaveUser(String email, String code) {
        // 1. Tìm thông tin trong Redis bằng email
        UserRedisCodeRequest redisData = userRedisCodeRequestRepository.findById(email.trim().toLowerCase())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_EXPIRED_OR_NOT_FOUND)); // Thông báo: OTP hết hạn hoặc
                                                                                          // email chưa đăng ký

        // 2. Kiểm tra mã OTP có khớp không
        if (!redisData.getCode().equals(code)) {
            throw new AppException(ErrorCode.OTP_INVALID); // Thông báo: Mã OTP không chính xác
        }

        // 3. OTP đúng -> Lấy Role USER
        Set<Roles> roleNames = new HashSet<>();
        roleNames.add(rolesRepository.findById("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND)));

        // 4. Chuyển dữ liệu từ Redis sang Entity của MySQL
        var user = Users.builder()
                .username(redisData.getUsername())
                .email(redisData.getEmail())
                .fullName(redisData.getFullName())
                .password(redisData.getPassword()) // Đã được mã hoá ở Bước 1
                .dob(redisData.getDob())
                .phone(redisData.getPhone())
                .roles(roleNames)
                .build();

        // 5. Lưu vào Database chính
        usersRepository.save(user);

        // 6. Xoá dữ liệu tạm trong Redis để dọn rác và tránh dùng lại OTP
        userRedisCodeRequestRepository.deleteById(email);
        userRedisCodeRequestRepository.deleteById(user.getUsername());

        return RegisterResponse.builder()
                .success(true)
                .build();
    }

    private String generateToken(Users user, String type, long durationSeconds) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("taphoa2hand.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now()
                                .plus(durationSeconds, ChronoUnit.SECONDS)
                                .toEpochMilli()))
                .claim("scope", buildScope(user))
                .claim("type", type) // Đóng dấu loại token ở đây
                .jwtID(UUID.randomUUID().toString());
        
        // Add passwordChangedAt claim for session invalidation
        if (user.getPasswordChangedAt() != null) {
            claimsBuilder.claim("passwordChangedAt", user.getPasswordChangedAt().toString());
        }
        
        JWTClaimsSet claimsSet = claimsBuilder.build();
        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new AppException(ErrorCode.CANNOT_CREATE_TOKEN);
        }
    }

    private String buildScope(Users user) {
        StringJoiner joiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                joiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> {
                        joiner.add(permission.getName());
                    });
            });
        return joiner.toString();
    }

    public void logout(LogoutRequest request) throws ParseException {
        JwtInfo jwtInfo = parseToken(request.getToken());
        Date expirationTime = jwtInfo.getExpirationTime();

        // Tính số giây còn lại
        long secondsLeft = (expirationTime.getTime() - System.currentTimeMillis()) / 1000;

        // Nếu token đã hết hạn từ trước thì thôi
        if (secondsLeft <= 0)
            return;

        RedisToken redisToken = RedisToken.builder()
                .jwtId(jwtInfo.getJwtId())
                .expirationTime(secondsLeft) // Lưu số giây (Seconds)
                .build();

        redisTokenRepository.save(redisToken);
    }

    private SignedJWT verifyToken(String token, String targetType) throws ParseException, JOSEException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        // 1. Kiểm tra chữ ký
        var verified = signedJWT.verify(verifier);
        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        if (!verified || expirationTime.before(new Date()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        // 2. Kiểm tra trong Blacklist Redis
        if (redisTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        // 3. Kiểm tra đúng loại token (ACCESS vs REFRESH)
        String tokenType = signedJWT.getJWTClaimsSet().getStringClaim("type");
        if (!targetType.equals(tokenType))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        // 4. Kiểm tra passwordChangedAt - nếu mật khẩu đã thay đổi sau khi token được tạo
        String tokenPasswordChangedAt = signedJWT.getJWTClaimsSet().getStringClaim("passwordChangedAt");
        if (tokenPasswordChangedAt != null) {
            String username = signedJWT.getJWTClaimsSet().getSubject();
            Users user = usersRepository.findByUsername(username).orElse(null);
            if (user != null && user.getPasswordChangedAt() != null) {
                LocalDateTime tokenPasswordTime = LocalDateTime.parse(tokenPasswordChangedAt);
                if (user.getPasswordChangedAt().isAfter(tokenPasswordTime)) {
                    throw new AppException(ErrorCode.PASSWORD_CHANGED_RELOGIN);
                }
            }
        }

        return signedJWT;
    }

    public JwtInfo parseToken(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
        String jwtId = claimsSet.getJWTID();
        Date expirationTime = claimsSet.getExpirationTime();
        Date issueTime = claimsSet.getIssueTime();
        return JwtInfo.builder()
                .jwtId(jwtId)
                .expirationTime(expirationTime)
                .issueTime(issueTime)
                .build();
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        // Bước 1: Xác thực token gửi lên (phải là REFRESH_TOKEN)
        var signedJWT = verifyToken(request.getToken(), "REFRESH_TOKEN");

        // Bước 2: Cho Refresh Token cũ vào Blacklist ngay lập tức
        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        long secondsLeft = (expiryTime.getTime() - System.currentTimeMillis()) / 1000;

        if (secondsLeft > 0) {
            RedisToken redisToken = RedisToken.builder()
                    .jwtId(jit)
                    .expirationTime(secondsLeft)
                    .build();
            redisTokenRepository.save(redisToken);
        }

        // Bước 3: Lấy user và cấp bộ token mới
        var username = signedJWT.getJWTClaimsSet().getSubject();
        var user = usersRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return AuthenticationResponse.builder()
                .token(generateToken(user, "ACCESS_TOKEN", ACCESS_TOKEN_DURATION_SECONDS)) // AT mới
                .refreshToken(generateToken(user, "REFRESH_TOKEN", REFRESH_TOKEN_DURATION_SECONDS)) // RT mới (30 ngày)
                .authenticated(true)
                .build();
    }
}
