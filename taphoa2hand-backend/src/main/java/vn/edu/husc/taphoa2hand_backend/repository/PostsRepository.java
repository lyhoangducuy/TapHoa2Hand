package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Posts;

@Repository
public interface PostsRepository extends JpaRepository<Posts, String> {
    
}
