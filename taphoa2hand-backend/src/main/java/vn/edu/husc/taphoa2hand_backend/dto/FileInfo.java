package vn.edu.husc.taphoa2hand_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class FileInfo {
    String name;
    String contentType;
    String targetType;
    long size;
    String md5Checksum;
    String path;
    String url;
}
