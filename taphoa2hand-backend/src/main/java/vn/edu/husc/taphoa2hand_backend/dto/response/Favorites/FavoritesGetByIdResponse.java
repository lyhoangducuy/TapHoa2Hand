package vn.edu.husc.taphoa2hand_backend.dto.response.Favorites;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.entity.Favorites;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class FavoritesGetByIdResponse {
    List<Favorites> favorites;
    @Builder.Default
    Boolean success=false;
}
