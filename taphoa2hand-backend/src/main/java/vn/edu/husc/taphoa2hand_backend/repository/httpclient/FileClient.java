package vn.edu.husc.taphoa2hand_backend.repository.httpclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import vn.edu.husc.taphoa2hand_backend.config.AuthencationRequestInterceptor;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.FilesResponse;
@FeignClient(name = "file-service", url = "${app.file-service.url}",
    configuration = {AuthencationRequestInterceptor.class})
public interface FileClient {
    @PostMapping(value = "/media/upload", consumes = "multipart/form-data")
    ApiResponse<FilesResponse> uploadMedia(@RequestPart("file") MultipartFile file);
}
