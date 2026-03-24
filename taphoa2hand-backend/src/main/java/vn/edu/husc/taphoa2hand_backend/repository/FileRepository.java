package vn.edu.husc.taphoa2hand_backend.repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import vn.edu.husc.taphoa2hand_backend.dto.FileInfo;

@Repository
public class FileRepository {   
    @Value("${app.file.storage-path}")
    private String storagePath;
    @Value("${app.file.download-prefix}")
    private String downloadPrefix;

    public FileInfo store(MultipartFile multipartFile) throws IOException{
        Path folder=Paths.get(storagePath);
        String fileExtension=StringUtils.getFilenameExtension(multipartFile.getOriginalFilename());
        String fileName= Objects.isNull(fileExtension)
            ?UUID.randomUUID().toString()
            :UUID.randomUUID().toString()+"."+fileExtension;
        Path filePath=folder.resolve(fileName).normalize().toAbsolutePath();
        Files.copy(multipartFile.getInputStream(), filePath,StandardCopyOption.REPLACE_EXISTING);
        return FileInfo.builder()
            .name(fileName)
            .contentType(multipartFile.getContentType())
            .size(multipartFile.getSize())
            .md5Checksum(DigestUtils.md5DigestAsHex(multipartFile.getInputStream()))
            .path(filePath.toString())
            .url(downloadPrefix+fileName)
            .build();
        
    }
}
