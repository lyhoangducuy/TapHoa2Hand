package vn.edu.husc.taphoa2hand_backend.config;

import java.util.HashSet;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.edu.husc.taphoa2hand_backend.entity.Roles;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.enums.RolesEnum;
import vn.edu.husc.taphoa2hand_backend.repository.RolesRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;
    RolesRepository rolesRepository;

    @Bean
    ApplicationRunner applicationRunner(UsersRepository usersRepository) {
        return args -> {
            if(usersRepository.findByUsername("admin").isEmpty()) {
                HashSet<Roles> roles = new HashSet<>();
                Roles rolesList = rolesRepository.findById("ADMIN").orElse(null);
                roles.add(rolesList);
                Users user=Users.builder()
                    .fullName("Administrator")
                    .username("admin")
                    .email("admin@gmail.com")
                    .roles(roles)
                    .password(passwordEncoder.encode("123456"))
                    .build();
                usersRepository.save(user);
                log.info("Admin user created with username: admin and password: 123456");
            }
        };
    }
}
