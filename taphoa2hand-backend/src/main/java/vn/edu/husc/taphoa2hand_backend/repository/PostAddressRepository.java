package vn.edu.husc.taphoa2hand_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.edu.husc.taphoa2hand_backend.entity.PostAddress;

public interface PostAddressRepository extends JpaRepository<PostAddress, String> {
    
}
