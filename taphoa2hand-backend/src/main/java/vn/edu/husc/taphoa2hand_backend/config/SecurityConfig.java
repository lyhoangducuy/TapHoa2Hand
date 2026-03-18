package vn.edu.husc.taphoa2hand_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())   // tắt CSRF để test POST bằng Postman
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()   // cho phép tất cả request
            )
            .httpBasic(Customizer.withDefaults()); // có thể bỏ dòng này cũng được

        return http.build();
    }
}
