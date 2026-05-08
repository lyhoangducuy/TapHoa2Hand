import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

export const getAdminDashboardStats = async () => {
    try {
        const response = await httpClient.get(API.ADMIN_DASHBOARD_STATS);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy thống kê dashboard:", error);
        throw error;
    }
};
