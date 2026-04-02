package vn.edu.husc.taphoa2hand_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import feign.codec.Encoder;
import feign.form.spring.SpringFormEncoder;

@Configuration
public class FeignConfig {
    @Bean
    public Encoder multipartFormEncoder(){
        return new SpringFormEncoder();
    }
}
