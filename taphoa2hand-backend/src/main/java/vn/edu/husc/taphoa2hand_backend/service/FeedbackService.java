package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import vn.edu.husc.taphoa2hand_backend.dto.request.FeedbackDTO;
import vn.edu.husc.taphoa2hand_backend.dto.response.AverageRatingResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackFullResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackMediaResponse;
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

    @Transactional
    public FeedbackResponse updateFeedback(String feedbackId, FeedbackDTO dto) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_FOUND));

        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new AppException(ErrorCode.VALID_EXCEPTION);
        }

        feedback.setRating(dto.getRating());
        if (dto.getComment() != null) {
            feedback.setComment(dto.getComment());
        }

        return feedbackMapper.toResponse(feedbackRepository.save(feedback));
    }
    @Transactional(readOnly = true)
    public Page<FeedbackResponse> adminGetAllFeedbacks(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Feedback> feedbackPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = "%" + keyword.trim().toLowerCase() + "%";
            feedbackPage = feedbackRepository.findAll(
                    (root, query, cb) -> {
                        var reviewer = root.join("reviewer");
                        var target = root.join("targetUser");
                        return cb.or(
                                cb.like(cb.lower(reviewer.get("username")), kw),
                                cb.like(cb.lower(reviewer.get("fullName")), kw),
                                cb.like(cb.lower(target.get("username")), kw),
                                cb.like(cb.lower(target.get("fullName")), kw),
                                cb.like(cb.lower(root.get("comment")), kw));
                    },
                    pageable);
        } else {
            feedbackPage = feedbackRepository.findAll(pageable);
        }

        return feedbackPage.map(feedbackMapper::toResponse);
    }

    public Page<FeedbackResponse> adminGetFeedbacksByUser(String userId, int page, int size) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ID_USER_NOT_FOUND));
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return feedbackRepository.findByTargetUser(userId, pageable)
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

    public boolean existsByOrderId(String orderId) {
        return feedbackRepository.findByOrderId(orderId).isPresent();
    }

    private String getCurrentUserId() {
        var context = SecurityContextHolder.getContext();
        return context.getAuthentication().getName();
    }

    public AverageRatingResponse getAverageRating(String userId) {
        Double avg = feedbackRepository.getAverageRatingByTargetUser(userId);
        Long count = feedbackRepository.countFeedbackByUserId(userId);
        return AverageRatingResponse.builder()
                .avgRating(avg != null ? avg : 0.0)
                .totalReviews(count != null ? count : 0L)
                .build();
    }

    @Transactional(readOnly = true)
    public List<FeedbackFullResponse> getFeedbackWithOrderPost(String userId) {

        List<Feedback> feedbacks = feedbackRepository.findFullByTargetUser(userId);

        return feedbacks.stream()
                .map((Feedback f) -> {

                    Order order = f.getOrder();

                    String postId = null;
                    String postTitle = null;
                    String postImage = null;

                    if (order != null
                            && order.getItems() != null
                            && !order.getItems().isEmpty()) {

                        var item = order.getItems().get(0);

                        if (item.getPost() != null) {

                            postId = item.getPost().getId();
                            postTitle = item.getPost().getTitle();

                            if (item.getPost().getPostImages() != null
                                    && !item.getPost().getPostImages().isEmpty()) {

                                postImage = item.getPost()
                                        .getPostImages()
                                        .get(0)
                                        .getImageUrl();
                            }
                        }
                    }

                    List<FeedbackMediaResponse> mediaResponses = f.getMediaList() != null
                            ? f.getMediaList().stream()
                                    .map(media -> FeedbackMediaResponse.builder()
                                            .id(media.getId())
                                            .url(media.getUrl())
                                            .contentType(media.getContentType())
                                            .size(media.getSize())
                                            .type(media.getType() != null
                                                    ? media.getType().name()
                                                    : null)
                                            .build())
                                    .toList()
                            : List.of();

                    return FeedbackFullResponse.builder()
                            .id(f.getId())
                            .rating(f.getRating())
                            .comment(f.getComment())

                            .orderId(order != null ? order.getId() : null)

                            .postId(postId)
                            .postTitle(postTitle)
                            .postImage(postImage)

                            .reviewerId(f.getReviewer() != null ? f.getReviewer().getId() : null)
                            .reviewerName(f.getReviewer() != null ? f.getReviewer().getUsername() : null)

                            .targetUserId(f.getTargetUser() != null ? f.getTargetUser().getId() : null)
                            .targetUserName(f.getTargetUser() != null ? f.getTargetUser().getUsername() : null)

                            .createdAt(f.getCreatedAt() != null ? f.getCreatedAt().toString() : null)

                            .mediaList(mediaResponses)

                            .build();
                })
                .toList();
    }

}
