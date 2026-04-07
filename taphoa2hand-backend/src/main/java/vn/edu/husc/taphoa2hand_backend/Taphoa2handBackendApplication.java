package vn.edu.husc.taphoa2hand_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class Taphoa2handBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(Taphoa2handBackendApplication.class, args);
	}

}
