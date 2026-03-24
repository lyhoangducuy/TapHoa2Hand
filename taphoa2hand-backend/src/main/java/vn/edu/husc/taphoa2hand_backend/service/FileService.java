package vn.edu.husc.taphoa2hand_backend.service;

import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.FileData;
import vn.edu.husc.taphoa2hand_backend.dto.response.FilesResponse;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.FileMgmtMapper;
import vn.edu.husc.taphoa2hand_backend.repository.FileMgmtRepository;
import vn.edu.husc.taphoa2hand_backend.repository.FileRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FileService {
    FileRepository fileRepository;
    FileMgmtRepository fileMgmtRepository;
    FileMgmtMapper fileMgmtMapper;
    // Trong FileMgmtService.java

    public FilesResponse uploadMedia(MultipartFile file, String targetType, String targetId) throws IOException {
        // Lưu file
        var fileInfo = fileRepository.store(file);
        // Lưu vào Database
        var fileMgmt = fileMgmtMapper.toFileMgmt(fileInfo);
        fileMgmt.setTargetType(targetType);
        fileMgmt.setTargetId(targetId);
        fileMgmt = fileMgmtRepository.save(fileMgmt);
        return FilesResponse.builder()
                .originalFileName(file.getOriginalFilename())
                .url(fileInfo.getUrl())
                .build();
    }

    public FileData downloadMedia(String fileName) throws IOException {
        var fileMgmt = fileMgmtRepository.findById(fileName)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        var resource = fileRepository.read(fileMgmt);
        return new FileData(fileMgmt.getContentType(), resource);
    }
}