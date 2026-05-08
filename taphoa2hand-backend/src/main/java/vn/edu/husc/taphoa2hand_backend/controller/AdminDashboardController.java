package vn.edu.husc.taphoa2hand_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.edu.husc.taphoa2hand_backend.dto.response.ApiResponse;
import vn.edu.husc.taphoa2hand_backend.dto.response.DashboardStatsResponse;
import vn.edu.husc.taphoa2hand_backend.repository.BannerRepository;
import vn.edu.husc.taphoa2hand_backend.repository.CategoryRepository;
import vn.edu.husc.taphoa2hand_backend.repository.FeedbackRepository;
import vn.edu.husc.taphoa2hand_backend.repository.OrderRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostsRepository;
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminDashboardController {
    UsersRepository usersRepository;
    PostsRepository postsRepository;
    OrderRepository orderRepository;
    CategoryRepository categoryRepository;
    FeedbackRepository feedbackRepository;
    BannerRepository bannerRepository;

    @GetMapping("/dashboard")
    public ApiResponse<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalUsers(usersRepository.count())
                .totalPosts(postsRepository.count())
                .totalOrders(orderRepository.count())
                .totalCategories(categoryRepository.count())
                .totalFeedbacks(feedbackRepository.count())
                .totalBanners(bannerRepository.count())
                .build();

        return ApiResponse.<DashboardStatsResponse>builder()
                .message("Thống kê dashboard admin")
                .result(stats)
                .build();
    }
}
