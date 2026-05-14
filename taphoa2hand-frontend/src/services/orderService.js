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

export const getAdminOrders = async (page = 0, size = 10) => {
    return await httpClient.get(`${API.ADMIN_GET_ORDERS}?page=${page}&size=${size}`);
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
    return await httpClient.post(
        `${API.GET_DETAIL_ORDER(orderId)}/confirm-payment`,
        {}
    );
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
    confirmPayment
};

export default orderService;