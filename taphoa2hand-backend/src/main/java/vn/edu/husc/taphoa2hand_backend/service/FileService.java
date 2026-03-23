package vn.edu.husc.taphoa2hand_backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import ch.qos.logback.core.util.StringUtil;

@Service
public class FileService {
    public Object uploadMedia(MultipartFile file) throws IOException {
        Path folder = Paths.get("D:/upload");
        String fileExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String fileName = Objects.isNull(fileExtension)
                ? UUID.randomUUID().toString()
                : UUID.randomUUID().toString()
                        + "."
                        + fileExtension;
        Path filePath=folder.resolve(fileName).normalize().toAbsolutePath();
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return null;

    }
}