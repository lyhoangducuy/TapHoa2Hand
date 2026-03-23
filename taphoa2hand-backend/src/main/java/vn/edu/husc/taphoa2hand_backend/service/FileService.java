package vn.edu.husc.taphoa2hand_backend.service;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {
    public Object uploadMedia(MultipartFile file) {
        Path folder=Paths.get("D:/upload");
        
    }
}