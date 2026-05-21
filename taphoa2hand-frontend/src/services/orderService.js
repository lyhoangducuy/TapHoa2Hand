import { API, CONFIG } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";
import { getToken } from "./localStorageService";

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
        console.error("Lỗi khi tạo đơn hàng:", error);
        throw error;
    }
};

export const getPurchases = async (page = 0, size = 10, status, paymentMethod) => {
    const statusQuery = status ? `&status=${encodeURIComponent(status)}` : '';
    const paymentQuery = paymentMethod ? `&paymentMethod=${encodeURIComponent(paymentMethod)}` : '';
    return await httpClient.get(`${API.GET_PURCHASES}?page=${page}&size=${size}${statusQuery}${paymentQuery}`);
};

export const getSales = async (page = 0, size = 10, status, paymentMethod) => {
    const statusQuery = status ? `&status=${encodeURIComponent(status)}` : '';
    const paymentQuery = paymentMethod ? `&paymentMethod=${encodeURIComponent(paymentMethod)}` : '';
    return await httpClient.get(`${API.GET_SALES}?page=${page}&size=${size}${statusQuery}${paymentQuery}`);
};

export const getOrderDetail = async (orderId) => {
    return await httpClient.get(API.GET_DETAIL_ORDER(orderId));
};

export const getAdminOrders = async (page = 0, size = 10, orderStatus, paymentMethod, paymentStatus) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (orderStatus) params.set('orderStatus', orderStatus);
    if (paymentMethod) params.set('paymentMethod', paymentMethod);
    if (paymentStatus) params.set('paymentStatus', paymentStatus);
    return await httpClient.get(`${API.ADMIN_GET_ORDERS}?${params.toString()}`);
};

export const updateOrderStatus = async (orderId, newStatus, body = {}) => {
    return await httpClient.patch(
        `${API.UPDATE_ORDER_STATUS(orderId)}?newStatus=${newStatus}`,
        body
    );
};

export const updateOrderStatusPost = async (orderId, newStatus) => {
    return await httpClient.post(
        API.UPDATE_ORDER_STATUS_POST,
        { orderId, newStatus }
    );
};

export const confirmPayment = async (orderId) => {
    return await httpClient.post(API.ORDER_CONFIRM_PAYMENT(orderId), {});
};

export const adminEscrowPayout = async (orderId) => {
    return await httpClient.post(API.ORDER_ADMIN_ESCROW_PAYOUT(orderId), {});
};

export const getOrdersOfPost = async (postId) => {
    return await httpClient.get(API.COUNT_ORDER_OF_POST(postId));
};

export const getCompletedOrderCount = async (userId, asBuyer = true) => {
    return await httpClient.get(`${API.COUNT_COMPLETED_ORDERS}?asBuyer=${asBuyer}&userId=${userId}`);
};

// Thêm cục này vào cuối cùng file orderService.js của bạn
const orderService = {
    createOrder,
    getPurchases,
    getSales,
    getOrderDetail,
    getAdminOrders,
    updateOrderStatus,
    updateOrderStatusPost,
    confirmPayment,
    adminEscrowPayout,
    getOrdersOfPost,
    getCompletedOrderCount,
};

export default orderService;