package vn.edu.husc.taphoa2hand_backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.entity.Roles;


@Repository
public interface UsersRepository extends JpaRepository<Users, String> {
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Optional<Users> findByUsername(String username);
    List<Users> findByRoles(Set<Roles> roles);
    
    // Statistics queries
    Long countByCreatedAtBetween(LocalDateTime fromDate, LocalDateTime toDate);
    
    Page<Users> findByCreatedAtBetween(LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);
    Optional<Users> findByEmail(String email);
}
