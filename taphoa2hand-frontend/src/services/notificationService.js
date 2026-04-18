import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";
import { getToken } from "./localstorageService";

export const getUserNotifications = async (userId) => {
    try {
        const response = await httpClient.get(API.GET_NOTIFICATIONS(userId), {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        return response.data; // Tùy cấu hình httpClient của bạn, có thể chỉ cần return response
    } catch (error) {
        console.error("Lỗi khi lấy danh sách thông báo:", error);
        throw error;
    }
};

// Tạo thông báo mới (Admin gửi cho User)
export const createNotification = async (notificationData) => {
    try {
        const response = await httpClient.post(API.CREATE_NOTIFICATION, notificationData, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo thông báo mới:", error);
        throw error;
    }
};

// Đánh dấu 1 thông báo là đã đọc
export const markNotificationAsRead = async (id) => {
    try {
        const response = await httpClient.put(API.MARK_READ_NOTIFICATION(id), {}, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đánh dấu đã đọc:", error);
        throw error;
    }
};

// Xóa thông báo
export const deleteNotification = async (id) => {
    try {
        const response = await httpClient.delete(API.DELETE_NOTIFICATION(id), {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa thông báo:", error);
        throw error;
    }
};
export const getUnreadNotificationCount = async (userId) => {
    try {
        const response = await httpClient.get(API.GET_UNREAD_NOTI_COUNT(userId), {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        return response.data; 
    } catch (error) {
        console.error("Lỗi khi lấy số lượng thông báo chưa đọc:", error);
        throw error;
    }
};