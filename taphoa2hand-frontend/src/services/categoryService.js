import { API, CONFIG } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";
import { getToken } from "./localstorageService";

export const getAllCategories = async () => {
    try {
        const response = await httpClient.get(API.CATEGORY);
        return response.data; // Thường Spring trả về ApiResponse, lấy .data để lấy body
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};
export const adminGetAllCategories = async (page = 0, size = 10) => {
    try {
        const token = localStorage.getItem('token');
        // Đã bỏ CONFIG.API_GATEWAY đi vì httpClient tự động nối Base URL
        const response = await httpClient.get(`${CONFIG.API_GATEWAY}${API.ADMIN_GET_CATEGORY}?page=${page}&size=${size}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi Admin lấy danh sach danh muc:", error);
        throw error;
    }
};

export const adminGetCategoryDetail = async (categoryId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(API.ADMIN_GET_CATEGORY_DETAIL(categoryId), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; 
    } catch (error) {
        console.error(`Lỗi khi Admin lấy chi tiết danh muc ID ${categoryId}:`, error);
        throw error;
    }
};


export const adminCreateCategory = async (categoryData) => {
    try {
        const token = getToken();
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_CREATE_CATEGORY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categoryData)
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi tạo danh muc mới:", error);
        throw error;
    }
};
export const adminUpdateCategory = async (categoryid, data) => {
    const token = getToken();
    const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_UPDATE_CATEGORY(categoryid)}`, { 
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
};
export const adminDeleteCategory = async (categoryId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.delete(API.ADMIN_DELETE_CATEGORY(categoryId), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi Admin xóa bài viết ID ${categoryId}:`, error);
        throw error;
    }
};