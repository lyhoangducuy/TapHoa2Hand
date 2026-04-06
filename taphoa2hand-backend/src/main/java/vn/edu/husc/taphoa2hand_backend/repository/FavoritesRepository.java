package vn.edu.husc.taphoa2hand_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.edu.husc.taphoa2hand_backend.entity.Favorites;

@Repository
public interface FavoritesRepository extends JpaRepository<Favorites, String> {
    public Optional<Favorites> findByUserIdAndProductId(String userId, String productId);
    public List<Favorites> findListByUserId(String userId);
}
