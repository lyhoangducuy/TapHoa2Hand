package vn.edu.husc.taphoa2hand_backend.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class RecaptchaService {

    @Value("${google.recaptcha.secret}")
    private String secretKey;

    public boolean verifyCaptcha(String token) {

        try {

            String url =
                    "https://www.google.com/recaptcha/api/siteverify";

            RestTemplate restTemplate = new RestTemplate();

            MultiValueMap<String, String> body =
                    new LinkedMultiValueMap<>();

            body.add("secret", secretKey);
            body.add("response", token);

            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(
                    MediaType.APPLICATION_FORM_URLENCODED
            );

            HttpEntity<MultiValueMap<String, String>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            url,
                            request,
                            Map.class
                    );

            Map responseBody = response.getBody();

            if (responseBody == null) {
                return false;
            }

            return Boolean.TRUE.equals(
                    responseBody.get("success")
            );

        } catch (Exception e) {
            return false;
        }
    }
}