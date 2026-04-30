package vn.edu.husc.taphoa2hand_backend.service;

import java.io.IOException;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.request.BannerDTO.BannerCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.BannerDTO.BannerUpdateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.Banner.BannerResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Banners;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.BannerMapper;
import vn.edu.husc.taphoa2hand_backend.repository.BannerRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class BannerService {
    BannerRepository bannerRepository;
    BannerMapper bannerMapper;
    FileService fileService;

    @Transactional(readOnly = true)
    
    public List<BannerResponse> getAll() {
        return bannerRepository.findAll().stream()
                .map(bannerMapper::toBannerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(bannerMapper::toBannerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BannerResponse getById(String id) {
        Banners banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_FOUND));
        return bannerMapper.toBannerResponse(banner);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public BannerResponse create(BannerCreateRequest request, MultipartFile desktopFile, MultipartFile mobileFile) {
        Banners banner = bannerMapper.toBanner(request);
        
        try {
            // Upload desktop image
            if (desktopFile != null && !desktopFile.isEmpty()) {
                var storedDesktopFile = fileService.uploadMedia(desktopFile);
                banner.setImageDesktop(storedDesktopFile.getUrl());
            }
            
            // Upload mobile image
            if (mobileFile != null && !mobileFile.isEmpty()) {
                var storedMobileFile = fileService.uploadMedia(mobileFile);
                banner.setImageMobile(storedMobileFile.getUrl());
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.SAVE_FILE_ERRROR);
        }
        
        return bannerMapper.toBannerResponse(bannerRepository.save(banner));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public BannerResponse update(String id, BannerUpdateRequest request) {
        Banners banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_FOUND));
        
        banner.setTitle(request.getTitle());
        banner.setImageDesktop(request.getImageDesktop());
        banner.setImageMobile(request.getImageMobile());
        banner.setTargetUrl(request.getTargetUrl());
        banner.setSortOrder(request.getSortOrder());
        banner.setIsActive(request.getIsActive());
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());
        
        return bannerMapper.toBannerResponse(bannerRepository.save(banner));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public BannerResponse delete(String id) {
        Banners banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BANNER_NOT_FOUND));
        bannerRepository.delete(banner);
        return bannerMapper.toBannerResponse(banner);
    }
}
