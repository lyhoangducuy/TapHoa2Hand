package vn.edu.husc.taphoa2hand_backend.dto.response;

import org.springframework.core.io.Resource;

public record FileData(String contentType, Resource resource) {
    
}
