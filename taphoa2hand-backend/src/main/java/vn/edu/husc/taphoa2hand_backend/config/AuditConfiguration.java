package vn.edu.husc.taphoa2hand_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.annotation.Nonnull;

import java.util.Optional;
@Configuration
public class AuditConfiguration implements AuditorAware<String> {

    @Override
    @Nonnull
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getName() != null
                ? Optional.ofNullable(authentication.getName())
                : Optional.empty();
    }
}