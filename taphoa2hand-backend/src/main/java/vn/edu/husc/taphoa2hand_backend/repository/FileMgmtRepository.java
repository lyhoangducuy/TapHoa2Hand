package vn.edu.husc.taphoa2hand_backend.repository;

import java.io.File;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.FileMgmt;
@Repository
public interface FileMgmtRepository extends JpaRepository<FileMgmt, String> {
    
}
