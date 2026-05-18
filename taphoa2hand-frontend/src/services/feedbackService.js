import { API, CONFIG } from "../configurations/configuration";
import { getToken } from "./localStorageService";


export const createFeedback = async (feedbackData, images = []) => {
    try {
        const formData = new FormData();

        // Part "data"
        formData.append(
            "data",
            new Blob([JSON.stringify(feedbackData)], {
                type: "application/json"
            })
        );

        // Part "images"
        if (images && images.length > 0) {
            images.forEach((file) => {
                formData.append("images", file);
            });
        }

        const response = await fetch(`${CONFIG.API_GATEWAY}${API.CREATE_FEEDBACK}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`
                // ❌ KHÔNG set Content-Type (browser tự set boundary)
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Lỗi khi tạo đánh giá");
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi tạo đánh giá:", error);
        throw error;
    }
};
// Lấy đánh giá theo Order ID
export const getFeedbackByOrderId = async (orderId) => {
    try {
        const token = getToken();
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.GET_FEEDBACK_BY_ORDER(orderId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            // Lấy message từ ApiResponse
            const errorMessage = data?.message || data?.error || 'Lỗi khi lấy đánh giá';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy đánh giá:", error);
        throw error;
    }
};

// Lấy danh sách đánh giá của một người dùng (người bị đánh giá)
export const getFeedbackByTargetUser = async (userId, page = 0, size = 20) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.GET_FEEDBACK_BY_USER(userId)}?page=${page}&size=${size}&sort=createdAt,desc`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi lấy danh sách đánh giá';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        throw error;
    }
};

// Lấy danh sách đánh giá của người dùng hiện tại (người đánh giá)
export const getFeedbackByReviewer = async (userId, page = 0, size = 20) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.GET_FEEDBACK_BY_REVIEWER(userId)}?page=${page}&size=${size}&sort=createdAt,desc`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi lấy danh sách đánh giá';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        throw error;
    }
};

// Lấy điểm đánh giá trung bình của một người dùng
export const getAverageRating = async (userId) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.GET_AVERAGE_RATING(userId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi lấy điểm đánh giá';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy điểm đánh giá:", error);
        throw error;
    }
};

// Lấy số lượng đánh giá của một người dùng
export const countFeedback = async (userId) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.COUNT_FEEDBACK(userId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi lấy số lượng đánh giá';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy số lượng đánh giá:", error);
        throw error;
    }
};

// Lấy danh sách đánh giá cho hồ sơ người dùng
export const getFeedbacksForProfile = async (userId) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.GET_FEEDBACKS_FOR_PROFILE(userId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi lấy đánh giá hồ sơ';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy đánh giá hồ sơ:", error);
        throw error;
    }
};

// Cập nhật đánh giá
export const updateFeedback = async (feedbackId, feedbackData) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.UPDATE_FEEDBACK(feedbackId)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(feedbackData)
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi cập nhật đánh giá';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi cập nhật đánh giá:", error);
        throw error;
    }
};

// Xóa đánh giá
export const deleteFeedback = async (feedbackId) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.DELETE_FEEDBACK(feedbackId)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi xóa đánh giá';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi xóa đánh giá:", error);
        throw error;
    }
};

// Admin: Lấy tất cả đánh giá
export const adminGetAllFeedbacks = async (page = 0, size = 20) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_GET_ALL_FEEDBACKS}?page=${page}&size=${size}&sort=createdAt,desc`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi lấy danh sách đánh giá';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        throw error;
    }
};

// Admin: Xóa đánh giá
export const adminDeleteFeedback = async (feedbackId) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_DELETE_FEEDBACK(feedbackId)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi xóa đánh giá';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi xóa đánh giá:", error);
        throw error;
    }
};

// Admin: Lấy đánh giá của một người dùng
export const adminGetFeedbacksByUser = async (userId, page = 0, size = 20) => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_GET_FEEDBACKS_BY_USER(userId)}?page=${page}&size=${size}&sort=createdAt,desc`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || 'Lỗi khi lấy đánh giá người dùng';
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("Lỗi khi lấy đánh giá người dùng:", error);
        throw error;
    }
};

