package vn.edu.husc.taphoa2hand_backend.config;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity 
@EnableMethodSecurity
public class SecurityConfig {


    @Autowired
    private CustomJwtDecoder jwtDecoder;

    private static final String[] PUBLIC_ENDPOINTS = {
        "/user/create",
        "/auth/introspect",
        "/auth/log-in",
        "/auth/logout"
    };
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request->
            request.requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
            .anyRequest().authenticated()
        );
        httpSecurity.oauth2ResourceServer(oauth2->
            oauth2.jwt(jwtConfigurer->jwtConfigurer.decoder(jwtDecoder)
                    .jwtAuthenticationConverter(jwtAuthenticationConverter()))  
                    .authenticationEntryPoint(new JwtAuthenticationEntryPoint()) 
        );
        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        return httpSecurity.build();
    };
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthorityPrefix("");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }
    // @Bean
    // JwtDecoder jwtDecoder() {
    //     SecretKeySpec secretKeySpec = new SecretKeySpec(signedKey.getBytes(), "HS512");
    //     return NimbusJwtDecoder.withSecretKey(secretKeySpec)
    //                             .macAlgorithm(MacAlgorithm.HS512)
    //                             .build();
    // };
}
