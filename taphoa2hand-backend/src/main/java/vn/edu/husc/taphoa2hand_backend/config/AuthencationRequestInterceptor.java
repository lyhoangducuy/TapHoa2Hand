package vn.edu.husc.taphoa2hand_backend.config;

import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AuthencationRequestInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes == null || attributes.getRequest() == null) {
            return;
        }

        String authHeader = attributes.getRequest().getHeader("Authorization");
        log.info("Header: {}", authHeader);

        if (StringUtils.hasText(authHeader)) {
            template.header("Authorization", authHeader);
        }
    }

}
