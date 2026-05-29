package vn.edu.husc.taphoa2hand_backend.service;

import java.net.MalformedURLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.content.Media;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.edu.husc.taphoa2hand_backend.dto.request.ChatAi.ChatAiRequest;
import vn.edu.husc.taphoa2hand_backend.dto.request.PostsDTO.PostAiCheckRecord;
import vn.edu.husc.taphoa2hand_backend.dto.request.Search.AiRecommendKeywordRecord;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.AiCheckResponseRecord;
import vn.edu.husc.taphoa2hand_backend.dto.response.Posts.PostsResponse;
import vn.edu.husc.taphoa2hand_backend.entity.PostAiAssessment;
import vn.edu.husc.taphoa2hand_backend.entity.PostStatusEnum;
import vn.edu.husc.taphoa2hand_backend.entity.Posts;
import vn.edu.husc.taphoa2hand_backend.entity.SearchHistory;
import vn.edu.husc.taphoa2hand_backend.exception.AppException;
import vn.edu.husc.taphoa2hand_backend.exception.ErrorCode;
import vn.edu.husc.taphoa2hand_backend.mapper.PostsMapper;
import vn.edu.husc.taphoa2hand_backend.repository.PostAiAssessmentRepository;
import vn.edu.husc.taphoa2hand_backend.repository.PostsRepository;
import vn.edu.husc.taphoa2hand_backend.repository.SearchHistoryRepository;

@Service
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ChatAiService {
    ChatClient chatClient;
    PostAiAssessmentRepository assessmentRepository;
    PostsRepository postsRepository;
    PostsMapper postsMapper;
    SearchHistoryService searchHistoryService;
    SearchHistoryRepository searchHistoryRepository;

    public ChatAiService(ChatClient.Builder builder,
            PostAiAssessmentRepository assessmentRepository,
            PostsRepository postsRepository, PostsMapper postsMapper,
            SearchHistoryService searchHistoryService,
            SearchHistoryRepository searchHistoryRepository) {
        this.chatClient = builder.build();
        this.assessmentRepository = assessmentRepository;
        this.postsRepository = postsRepository;
        this.postsMapper = postsMapper;
        this.searchHistoryService = searchHistoryService;
        this.searchHistoryRepository = searchHistoryRepository;
    }

    public String chatAi(ChatAiRequest chatAiRequest) {
        SystemMessage systemMessage = new SystemMessage("""
                You are taphao2hand AI
                """);
        UserMessage userMessage = new UserMessage(chatAiRequest.message());
        Prompt prompt = new Prompt(systemMessage, userMessage);
        return chatClient.prompt(prompt).call().entity(String.class);
    }

    public String chatWitImage(MultipartFile file, String message) {

        ChatOptions chatOption = ChatOptions.builder()
                .temperature(0D)
                .build();
        // no image
        if (file == null || file.isEmpty()) {
            return chatClient.prompt()
                    .options(chatOption)
                    .system("You are taphoa2hand")
                    .user(message)
                    .call()
                    .content();
        }
        // have image
        Media media = Media.builder()
                .mimeType(MimeTypeUtils.parseMimeType(file.getContentType()))
                .data(file.getResource())
                .build();

        return chatClient.prompt()
                .options(chatOption)
                .system("You are taphoa2hand")
                .user(promptUserSpec -> promptUserSpec.media(media).text(message))
                .call()
                .content();
    }

    @Transactional // Đảm bảo lỗi DB thì rollback
    public AiCheckResponseRecord assessPost(String postId) {
        // 1. Lấy thông tin bài viết
        Posts post = postsRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND)); // Thay bằng ErrorCode của bạn

        // 2. Kiểm tra kết quả thẩm định cũ trong DB
        var existingAssessment = assessmentRepository.findById(postId);

        if (existingAssessment.isPresent()) {
            PostAiAssessment assessment = existingAssessment.get();

            // Nếu bài viết chưa bị update kể từ lần AI check cuối cùng -> Dùng lại kết quả
            // cũ
            if (post.getUpdatedAt() == null || assessment.getLastAnalyzedAt().isAfter(post.getUpdatedAt())) {
                log.info(">>> [AI CACHE HIT] Trả về kết quả từ DB cho Post: {}", postId);
                return new AiCheckResponseRecord(
                        assessment.isMatching(),
                        assessment.getEstimatedWearLevel(),
                        assessment.getReason(),
                        assessment.getRecommendation());
            }
            log.info(">>> [AI CACHE EXPIRED] Bài viết đã bị sửa đổi, cần gọi AI check lại cho Post: {}", postId);
        }

        // 3. Nếu chưa có hoặc đã bị sửa đổi -> Map ra Record và gọi AI
        PostAiCheckRecord postRecord = PostsMapper.toAiCheckRecord(post);
        AiCheckResponseRecord aiResult = callAiToAnalyze(postRecord);

        // 4. LƯU MỚI HOẶC CẬP NHẬT KẾT QUẢ VÀO DATABASE
        PostAiAssessment assessmentToSave;

        if (existingAssessment.isPresent()) {
            // TRƯỜNG HỢP 1: Đã có trong DB (nhưng kết quả cũ bị hết hạn)
            // -> Lấy entity cũ ra để cập nhật (UPDATE) thay vì tạo mới để tránh lỗi
            // Hibernate
            assessmentToSave = existingAssessment.get();
            assessmentToSave.setMatching(aiResult.isMatching());
            assessmentToSave.setEstimatedWearLevel(aiResult.estimatedWearLevel());
            assessmentToSave.setReason(aiResult.reason());
            assessmentToSave.setRecommendation(aiResult.recommendation());
            assessmentToSave.setLastAnalyzedAt(LocalDateTime.now());
        } else {
            // TRƯỜNG HỢP 2: Lần đầu tiên thẩm định
            // -> Tạo mới. LƯU Ý: KHÔNG GÁN .postId(), để @MapsId tự động lấy từ .post()
            assessmentToSave = PostAiAssessment.builder()
                    .post(post) // Chỉ gán post, không gán postId
                    .isMatching(aiResult.isMatching())
                    .estimatedWearLevel(aiResult.estimatedWearLevel())
                    .reason(aiResult.reason())
                    .recommendation(aiResult.recommendation())
                    .lastAnalyzedAt(LocalDateTime.now())
                    .build();
        }

        assessmentRepository.save(assessmentToSave);
        log.info(">>> [AI SUCCESS] Đã lưu kết quả thẩm định mới cho Post: {}", postId);

        return aiResult;
    }

    /**
     * HÀM PRIVATE: Chuyên tâm làm việc với Spring AI (Prompt, Image Media, JSON
     * Converter)
     */
    private AiCheckResponseRecord callAiToAnalyze(PostAiCheckRecord postRecord) {
        BeanOutputConverter<AiCheckResponseRecord> converter = new BeanOutputConverter<>(AiCheckResponseRecord.class);

        String systemPrompt = """
                Bạn là chuyên gia thẩm định đồ cũ của taphoa2hand.
                So sánh thông tin khai báo và ảnh thực tế để tìm điểm bất thường.
                %s
                """.formatted(converter.getFormat());

        String userPrompt = """
                - Tên: %s
                - Giá: %s
                - Hãng/Model: %s / %s
                - Tình trạng khai báo: %s
                - Đã dùng: %s
                - Lý do bán: %s
                - Mô tả: %s
                """.formatted(
                postRecord.title(), postRecord.price(), postRecord.brand(), postRecord.model(),
                postRecord.condition(), postRecord.usedDuration(), postRecord.reasonForSelling(),
                postRecord.description());

        // Chuẩn bị Media từ UrlResource (Có try-catch chuẩn thực tế)
        List<Media> mediaList = new ArrayList<>();
        if (postRecord.imageUrls() != null) {
            for (String url : postRecord.imageUrls()) {
                try {
                    UrlResource imageResource = new UrlResource(url);
                    mediaList.add(new Media(MimeTypeUtils.IMAGE_JPEG, imageResource));
                } catch (MalformedURLException e) {
                    // Lỗi 1 ảnh thì bỏ qua ảnh đó, vẫn phân tích các ảnh còn lại
                    log.error(">>> [AI WARN] Không thể đọc ảnh từ URL: {}", url, e);
                }
            }
        }

        ChatOptions chatOptions = ChatOptions.builder()
                .temperature(0.0) // Bắt buộc = 0.0 để AI không bịa chuyện
                .build();

        try {
            String aiResponse = chatClient.prompt()
                    .options(chatOptions)
                    .system(systemPrompt)
                    .user(userSpec -> {
                        userSpec.text(userPrompt);
                        if (!mediaList.isEmpty()) {
                            userSpec.media(mediaList.toArray(new Media[0]));
                        }
                    })
                    .call()
                    .content();

            return converter.convert(aiResponse);

        } catch (Exception e) {
            log.error(">>> [AI ERROR] Lỗi khi gọi API AI", e);
            throw new AppException(ErrorCode.UNAUTHENTICATED); // Thay bằng mã lỗi AI cụ thể của bạn
        }
    }

    @Transactional(readOnly = true)
    public List<PostsResponse> recommendPosts(
            String userId) {

        // =========================
        // LẤY 5 KEYWORD GẦN NHẤT
        // =========================
        List<String> keywords = searchHistoryRepository
                .findTop20ByUserIdAndKeywordIsNotNullOrderByCreatedAtDesc(
                        userId)
                .stream()
                .map(SearchHistory::getKeyword)
                .filter(keyword -> !keyword.isBlank())
                .distinct()
                .toList();
        // =========================
        // KHÔNG CÓ HISTORY
        // =========================
        if (keywords.isEmpty()) {
            return List.of();
        }

        // =========================
        // DANH SÁCH RECOMMEND
        // =========================
        Set<Posts> recommendedPosts = new LinkedHashSet<>();

        // =========================
        // SEARCH THEO KEYWORD
        // =========================
        for (String keyword : keywords) {

            Page<Posts> page = postsRepository
                    .recommendPostsByKeyword(
                            keyword,
                            List.of(
                                    PostStatusEnum.AVAILABLE,
                                    PostStatusEnum.SEARCHING),
                            PageRequest.of(0, 10));
            recommendedPosts.addAll(
                    page.getContent());

            // limit tối đa 20 bài
            if (recommendedPosts.size() >= 20) {
                break;
            }
        }

        // =========================
        // MAP RESPONSE
        // =========================
        return recommendedPosts.stream()
                .limit(20)
                .map(postsMapper::toPostsResponse)
                .toList();
    }

}