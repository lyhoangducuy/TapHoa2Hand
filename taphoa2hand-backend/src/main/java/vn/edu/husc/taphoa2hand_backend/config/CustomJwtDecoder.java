package vn.edu.husc.taphoa2hand_backend.config;

import java.text.ParseException;
import java.util.Objects;

import javax.crypto.spec.SecretKeySpec;

import org.apache.el.parser.JJTELParserState;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import com.nimbusds.jose.JOSEException;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import vn.edu.husc.taphoa2hand_backend.dto.JwtInfo;
import vn.edu.husc.taphoa2hand_backend.dto.request.AuthenDTO.IntrospectRequest;
import vn.edu.husc.taphoa2hand_backend.service.AuthenticationService;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CustomJwtDecoder implements JwtDecoder {
    
    AuthenticationService authenticationService;
    @NonFinal
    NimbusJwtDecoder nimbusJwtDecoder=null;
    @NonFinal
    @Value("${jwt.signed-key}")
    protected String SIGNER_KEY;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            // 1. Gọi introspect để kiểm tra token còn hợp lệ trong DB (chưa blacklist, chưa đổi pass)
            var response = authenticationService.introspect(IntrospectRequest.builder()
                    .token(token)
                    .tokenType("ACCESS_TOKEN")
                    .build());
            if (!response.isValid()) {
                throw new JwtException("Token đã bị vô hiệu hóa hoặc hết hạn");
            }

            // 2. Lấy userId từ token để kiểm tra blocked
            var jwtInfo = authenticationService.parseToken(token);
            if (jwtInfo.getUserId() != null) {
                boolean isBlocked = authenticationService.isUserBlocked(jwtInfo.getUserId());
                if (isBlocked) {
                    throw new JwtException("Tài khoản đã bị khóa");
                }
            }
        } catch (JOSEException | ParseException e) {
            throw new JwtException(e.getMessage());
        }
        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(SIGNER_KEY.getBytes(), "HmacSHA256");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }
        return nimbusJwtDecoder.decode(token);
    }
    
}
