package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Categories;

@Repository
public interface CategoryRepository extends JpaRepository<Categories, String> {
    Categories findByName(String name);
    boolean existsByName(String name);
}
