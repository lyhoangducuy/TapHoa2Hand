package vn.edu.husc.taphoa2hand_backend.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
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

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import vn.edu.husc.taphoa2hand_backend.dto.JwtInfo;
import vn.edu.husc.taphoa2hand_backend.dto.request.LogoutRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.RefreshRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.AuthenticationRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.IntrospectRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.AuthenticationResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.IntrospectResponse;
import vn.edu.husc.taphoa2hand_backend.entity.RedisToken;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.repository.RedisTokenRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UsersRepository usersRepository;
    PasswordEncoder passwordEncoder;
    RedisTokenRepository redisTokenRepository;
    @NonFinal
    @Value("${jwt.signed-key}")
    protected String SIGNER_KEY;
    @NonFinal
    @Value("${jwt.access-token-duration-seconds}")
    protected Integer ACCESS_TOKEN_DURATION_SECONDS;
    @NonFinal
    @Value("${jwt.refresh-token-duration-seconds}")
    protected Integer REFRESH_TOKEN_DURATION_SECONDS;
    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isVerified = true;
        try {
            verifyToken(token, request.getTokenType());
        } catch (Exception e) {
            isVerified = false;
        }
        return IntrospectResponse.builder()
                .valid(isVerified)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = usersRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated)
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        var token = generateToken(user, "ACCESS_TOKEN", ACCESS_TOKEN_DURATION_SECONDS );
        var refreshToken = generateToken(user, "REFRESH_TOKEN", REFRESH_TOKEN_DURATION_SECONDS);
        return AuthenticationResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .authenticated(true)
                .build();
    }

    private String generateToken(Users user, String type, long durationSeconds) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("taphoa2hand.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now()
                                .plus(durationSeconds, ChronoUnit.SECONDS)
                                .toEpochMilli()))
                .claim("scope", buildScope(user))
                .claim("type", type) // Đóng dấu loại token ở đây
                .jwtID(UUID.randomUUID().toString())
                .build();
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
