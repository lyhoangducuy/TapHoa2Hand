package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Users;

@Repository
public interface UsersRepository extends JpaRepository<Users, String> {
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Optional<Users> findByUsername(String username);
}
