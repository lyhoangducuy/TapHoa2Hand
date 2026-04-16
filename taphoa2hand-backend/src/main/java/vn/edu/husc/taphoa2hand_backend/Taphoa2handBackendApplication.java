package vn.edu.husc.taphoa2hand_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class Taphoa2handBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(Taphoa2handBackendApplication.class, args);
	}

}
