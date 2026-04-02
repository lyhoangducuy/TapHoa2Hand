package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.edu.husc.taphoa2hand_backend.entity.PostImage;

public interface PostImageRepository extends JpaRepository<PostImage, String> {
    
}
