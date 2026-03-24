package vn.edu.husc.taphoa2hand_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class FileMgmt {
    @Id
    String id;
    String contentType;
    //post, user
    String targetType;
    //id of post or user
    String targetId;
    long size;
    String md5Checksum;
    String path;
}
