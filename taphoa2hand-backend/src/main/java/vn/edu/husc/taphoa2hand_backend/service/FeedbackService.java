package vn.edu.husc.taphoa2hand_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import vn.edu.husc.taphoa2hand_backend.dto.request.FeedbackDTO;
import vn.edu.husc.taphoa2hand_backend.dto.response.FeedbackResponse;
import vn.edu.husc.taphoa2hand_backend.entity.Feedback;
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

    public FeedbackResponse createFeedback(FeedbackDTO feedbackDTO) {
        Order order = orderRepository.findById(feedbackDTO.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (feedbackRepository.findByOrderId(feedbackDTO.getOrderId()).isPresent()) {
            throw new AppException(ErrorCode.FEEDBACK_ALREADY_EXISTS);
        }

        Users currentUser = usersRepository.findById(getCurrentUserId())
                .orElseThrow(() -> new AppException(ErrorCode.ID_USER_NOT_FOUND));

        Feedback feedback = Feedback.builder()
                .order(order)
                .reviewer(currentUser)
                .targetUser(order.getSeller())
                .rating(feedbackDTO.getRating())
                .comment(feedbackDTO.getComment())
                .imageUrl(feedbackDTO.getImageUrl())
                .build();

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return feedbackMapper.toResponse(savedFeedback);
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
        // TODO: Implement to get current logged-in user ID from SecurityContextHolder
        return "";
    }
}
