package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.ForgotPasswordRedis;


@Repository
public interface ForgotPasswordRedisRepository extends CrudRepository<ForgotPasswordRedis, String>{
    
}
