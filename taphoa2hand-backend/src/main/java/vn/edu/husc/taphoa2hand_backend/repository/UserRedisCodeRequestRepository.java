package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.repository.CrudRepository;

import vn.edu.husc.taphoa2hand_backend.dto.request.UserRedisCodeRequest;

public interface UserRedisCodeRequestRepository  extends CrudRepository<UserRedisCodeRequest, String> {
    boolean existsByUsername(String username);
}
