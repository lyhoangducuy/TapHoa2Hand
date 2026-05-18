package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;
import vn.edu.husc.taphoa2hand_backend.dto.request.FeedbackDTO;
import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Feedback;
import vn.edu.husc.taphoa2hand_backend.entity.FeedbackMedia;
import vn.edu.husc.taphoa2hand_backend.entity.MediaType;
import vn.edu.husc.taphoa2hand_backend.entity.Order;
import vn.edu.husc.taphoa2hand_backend.entity.Users;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.FeedbackMapper;
import vn.edu.husc.taphoa2hand_backend.repository.FeedbackRepository;
import vn.edu.husc.taphoa2hand_backend.repository.OrderRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackService {
    FeedbackRepository feedbackRepository;
    FeedbackMapper feedbackMapper;
    UsersRepository usersRepository;
    OrderRepository orderRepository;
    FileService fileService;

    @Transactional
    public FeedbackResponse createFeedback(FeedbackDTO dto, List<MultipartFile> images) throws IOException {

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (feedbackRepository.findByOrderId(dto.getOrderId()).isPresent()) {
            throw new AppException(ErrorCode.FEEDBACK_ALREADY_EXISTS);
        }

        String username = getCurrentUserId();

        Feedback feedback = Feedback.builder()
                .order(order)
                .reviewer(usersRepository.findByUsername(username)
                        .orElseThrow(() -> new AppException(ErrorCode.ID_USER_NOT_FOUND)))
                .targetUser(order.getSeller())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        // ===== MEDIA (GIỐNG POSTS) =====
        List<FeedbackMedia> mediaList = new ArrayList<>();

        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {

                var fileInfo = fileService.uploadMedia(file);

                FeedbackMedia media = new FeedbackMedia();
                media.setUrl(fileInfo.getUrl());
                media.setContentType(file.getContentType());
                media.setSize(file.getSize());
                media.setType(MediaType.IMAGE);

                media.setFeedback(feedback);

                mediaList.add(media);
            }
        }

        feedback.setMediaList(mediaList);

        Feedback saved = feedbackRepository.save(feedback);

        return feedbackMapper.toResponse(saved);
    }

    public FeedbackResponse getFeedbackByOrderId(String orderId) {
        Feedback feedback = feedbackRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_FOUND));
        return feedbackMapper.toResponse(feedback);
    }

    public Page<FeedbackResponse> getAllFeedbacks(Pageable pageable) {
        return feedbackRepository.findAll(pageable)
                .map(feedbackMapper::toResponse);
    }

    public Page<FeedbackResponse> getFeedbackByTargetUser(String targetUserId, Pageable pageable) {
        Users targetUser = usersRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.ID_USER_NOT_FOUND));
        return feedbackRepository.findByTargetUser(targetUserId, pageable)
                .map(feedbackMapper::toResponse);
    }

    public void deleteFeedback(String feedbackId) {
        if (!feedbackRepository.existsById(feedbackId)) {
            throw new AppException(ErrorCode.FEEDBACK_NOT_FOUND);
        }
        feedbackRepository.deleteById(feedbackId);
    }

    private String getCurrentUserId() {
        var context = SecurityContextHolder.getContext();
        return context.getAuthentication().getName();
    }
}
