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

export const getPurchases = async (page = 0, size = 10, sort = 'createdAt,desc') => {
    return await httpClient.get(`${API.GET_PURCHASES}?page=${page}&size=${size}&sort=${sort}`, getAuthHeaders());
};

export const getSales = async (page = 0, size = 10, sort = 'createdAt,desc') => {
    return await httpClient.get(`${API.GET_SALES}?page=${page}&size=${size}&sort=${sort}`, getAuthHeaders());
};

export const getOrderDetail = async (orderId) => {
    // API.GET_DETAIL_ORDER(orderId) trả về string URL
    return await httpClient.get(API.GET_DETAIL_ORDER(orderId), getAuthHeaders());
};
export const updateOrderStatus = async (orderId, newStatus) => {
    return await httpClient.patch(
        `${API.UPDATE_ORDER_STATUS(orderId)}?newStatus=${newStatus}`,
        {},
        getAuthHeaders()
    );
};

export const updateOrderStatusPost = async (orderId, newStatus) => {
    return await httpClient.post(
        API.UPDATE_ORDER_STATUS_POST,
        { orderId, newStatus },
        getAuthHeaders()
    );
};
// Thêm cục này vào cuối cùng file orderService.js của bạn
const orderService = {
    createOrder,
    getOrderDetail,
    updateOrderStatus,
    updateOrderStatusPost
};

export default orderService;