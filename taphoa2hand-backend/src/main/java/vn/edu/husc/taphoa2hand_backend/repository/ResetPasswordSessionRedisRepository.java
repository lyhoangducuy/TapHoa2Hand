package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.ResetPasswordSessionRedis;

@Repository
public interface ResetPasswordSessionRedisRepository extends CrudRepository<ResetPasswordSessionRedis, String> {
}
