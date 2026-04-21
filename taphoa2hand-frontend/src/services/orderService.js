import { API, CONFIG } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";
import { getToken } from "./localstorageService";

// Helper để lấy headers có kèm Token
const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});


export const createOrder = async (orderData) => {
    try {
        const token = getToken();
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.CREATE_ORDER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi tạo user mới:", error);
        throw error;
    }
};

export const getMyPurchases = async () => {
    return await httpClient.get(API.GET_PURCHASES, getAuthHeaders());
};

export const getMySales = async () => {
    return await httpClient.get(API.GET_SALES, getAuthHeaders());
};

export const getOrderDetail = async (orderId) => {
    // API.GET_DETAIL_ORDER(orderId) trả về string URL
    return await httpClient.get(API.GET_DETAIL_ORDER(orderId), getAuthHeaders());
};

export const updateOrderStatus = async (orderId, status) => {
    // Dùng patch và gửi status qua params như cấu trúc Backend đã viết
    return await httpClient.patch(
        `${API.UPDATE_ORDER_STATUS(orderId)}?status=${status}`, 
        {}, // Body trống
        getAuthHeaders()
    );
};
// Thêm cục này vào cuối cùng file orderService.js của bạn
const orderService = {
    createOrder,
    getMyPurchases,
    getMySales,
    getOrderDetail,
    updateOrderStatus
};

export default orderService;