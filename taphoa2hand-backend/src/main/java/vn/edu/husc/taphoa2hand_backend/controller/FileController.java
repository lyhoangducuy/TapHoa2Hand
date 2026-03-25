package vn.edu.husc.taphoa2hand_backend.controller;

import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.FilesResponse;
import vn.edu.husc.taphoa2hand_backend.service.FileService;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FileController {
    FileService fileService;

    @PostMapping("/upload")
    ApiResponse<FilesResponse> uploadMedia(@RequestParam("file") MultipartFile file,@RequestParam("targetType") String targetType, @RequestParam("targetId") String targetId) throws IOException{
        return ApiResponse.<FilesResponse>builder()
            .result(fileService.uploadMedia(file,targetType,targetId))
            .build();
    }
    @GetMapping("/download/{fileName}")
    ResponseEntity<Resource> downloadMedia(@PathVariable("fileName") String fileName) throws IOException{
        var fileData = fileService.downloadMedia(fileName);
        return ResponseEntity.<Resource>ok()
            .header(HttpHeaders.CONTENT_TYPE, fileData.contentType())
            .body(fileData.resource());
    }
}
