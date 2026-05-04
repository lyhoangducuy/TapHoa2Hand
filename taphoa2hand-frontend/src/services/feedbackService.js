import { API, CONFIG } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";
import { getToken } from "./localStorageService";

// Helper để lấy headers có kèm Token
const getAuthHeaders = () => ({
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    }
});

// Tạo đánh giá mới
export const createFeedback = async (feedbackData) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}/api/feedbacks/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(feedbackData)
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi tạo đánh giá:", error);
        throw error;
    }
};

// Lấy đánh giá theo Order ID
export const getFeedbackByOrderId = async (orderId) => {
    try {
        const token = getToken();
        const response = await fetch(`${CONFIG.API_GATEWAY}/api/feedbacks/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
        throw error;
    }
};

// Lấy danh sách đánh giá của một người dùng (người bị đánh giá)
export const getFeedbackByTargetUser = async (userId, page = 0, size = 20) => {
    return await httpClient.get(
        `/api/feedbacks/user/${userId}?page=${page}&size=${size}&sort=createdAt,desc`,
        getAuthHeaders()
    );
};

// Lấy danh sách đánh giá của người dùng hiện tại (người đánh giá)
export const getFeedbackByReviewer = async (userId, page = 0, size = 20) => {
    return await httpClient.get(
        `/api/feedbacks/reviewer/${userId}?page=${page}&size=${size}&sort=createdAt,desc`,
        getAuthHeaders()
    );
};

// Lấy điểm đánh giá trung bình của một người dùng
export const getAverageRating = async (userId) => {
    return await httpClient.get(`/api/feedbacks/rating/${userId}`, getAuthHeaders());
};

// Lấy số lượng đánh giá của một người dùng
export const countFeedback = async (userId) => {
    return await httpClient.get(`/api/feedbacks/count/${userId}`, getAuthHeaders());
};

// Lấy danh sách đánh giá cho hồ sơ người dùng
export const getFeedbacksForProfile = async (userId) => {
    return await httpClient.get(`/api/feedbacks/profile/${userId}`, getAuthHeaders());
};

// Cập nhật đánh giá
export const updateFeedback = async (feedbackId, feedbackData) => {
    return await httpClient.put(
        `/api/feedbacks/${feedbackId}`,
        feedbackData,
        getAuthHeaders()
    );
};

// Xóa đánh giá
export const deleteFeedback = async (feedbackId) => {
    return await httpClient.delete(`/api/feedbacks/${feedbackId}`, getAuthHeaders());
};

// Admin: Lấy tất cả đánh giá
export const adminGetAllFeedbacks = async (page = 0, size = 20) => {
    return await httpClient.get(
        `/admin/feedbacks?page=${page}&size=${size}&sort=createdAt,desc`,
        getAuthHeaders()
    );
};

// Admin: Xóa đánh giá
export const adminDeleteFeedback = async (feedbackId) => {
    return await httpClient.delete(`/admin/feedbacks/${feedbackId}`, getAuthHeaders());
};

// Admin: Lấy đánh giá của một người dùng
export const adminGetFeedbacksByUser = async (userId, page = 0, size = 20) => {
    return await httpClient.get(
        `/admin/feedbacks/user/${userId}?page=${page}&size=${size}&sort=createdAt,desc`,
        getAuthHeaders()
    );
};
