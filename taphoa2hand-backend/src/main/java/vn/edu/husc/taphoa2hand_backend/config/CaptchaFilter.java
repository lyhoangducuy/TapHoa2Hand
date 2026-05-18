package vn.edu.husc.taphoa2hand_backend.config;

import java.io.IOException;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.service.LoginAttemptService;
import vn.edu.husc.taphoa2hand_backend.service.RecaptchaService;

@Component
@RequiredArgsConstructor
public class CaptchaFilter
        extends OncePerRequestFilter {

    private final RecaptchaService recaptchaService;

    private final LoginAttemptService
            loginAttemptService;

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {

        String path = request.getServletPath();
        String method = request.getMethod();

        return !(
                HttpMethod.POST.matches(method)
                        &&
                path.equals("/auth/login")
        );
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        CachedBodyHttpServletRequest cachedRequest =
                new CachedBodyHttpServletRequest(request);

        JsonNode body;

        try {

            body = objectMapper.readTree(
                    cachedRequest.getInputStream()
            );

        } catch (Exception e) {

            writeErrorResponse(
                    response,
                     ErrorCode.VALID_EXCEPTION
            );

            return;
        }

        String username =
                body.get("username").asText();

        boolean requireCaptcha =
                loginAttemptService
                        .requireCaptcha(username);

        // Chưa cần captcha
        if (!requireCaptcha) {

            filterChain.doFilter(
                    cachedRequest,
                    response
            );

            return;
        }

        JsonNode captchaNode =
                body.get("captchaToken");

        // Thiếu captcha
        if (
                captchaNode == null
                || captchaNode.asText().isBlank()
        ) {

            writeErrorResponse(
                    response,
                    ErrorCode.CAPTCHA_REQUIRED
            );

            return;
        }

        boolean valid =
                recaptchaService.verifyCaptcha(
                        captchaNode.asText()
                );

        if (!valid) {

            writeErrorResponse(
                    response,
                     ErrorCode.CAPTCHA_INVALID
            );

            return;
        }

        filterChain.doFilter(
                cachedRequest,
                response
        );
    }

    private void writeErrorResponse(
        HttpServletResponse response,
        ErrorCode errorCode
) throws IOException {

    response.setStatus(
            errorCode.getHttpStatusCode().value()
    );

    response.setContentType(
            "application/json"
    );

    response.setCharacterEncoding(
            "UTF-8"
    );

    response.getWriter().write(
            """
            {
                "code": %d,
                "message": "%s"
            }
            """.formatted(
                    errorCode.getCode(),
                    errorCode.getMessage()
            )
    );
}
}