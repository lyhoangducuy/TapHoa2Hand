import { API, CONFIG } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";
import { getToken } from "./localstorageService";

// =========================================================
// 1. CÁC API DÀNH CHO USER (NGƯỜI DÙNG TỰ QUẢN LÝ)
// =========================================================

export const getMyInfo = async () => {
    return await httpClient.get(API.MY_INFO, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
};

export const updateUserInfo = async (userId, data) => {
    const token = getToken();
    const response = await fetch(`${CONFIG.API_GATEWAY}${API.UPDATE_USER(userId)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
};

export const updateAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();

    // Không set Content-Type để trình duyệt tự gen boundary cho file
    return await fetch(`${CONFIG.API_GATEWAY}${API.UPDATE_AVATAR}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData,
    }).then(res => res.json()); 
};

// =========================================================
// 2. CÁC API DÀNH CHO ADMIN (QUẢN LÝ TẤT CẢ USERS)
// =========================================================

export const getUserAdmin = async (page = 0, size = 10) => {
    try {
        const token = getToken(); 
        const url = `${CONFIG.API_GATEWAY}${API.ADMIN_GETUSER}?page=${page}&size=${size}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API getUserAdmin:", error);
        throw error;
    }
};

export const getInfoAdmin = async (userId) => {
    const response = await httpClient.get(API.ADMIN_GETINFO(userId), {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    // httpClient (axios) trả data ở response.data
    return response.data; 
};

export const getUserById = async (userId) => {
    try {
        const response = await httpClient.get(`/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user by id', error);
        return null;
    }
};

export const createUserAdmin = async (userData) => {
    try {
        const token = getToken();
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_CREATE_USER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi tạo user mới:", error);
        throw error;
    }
};

export const updateUserInfoAdmin = async (userId, data) => {
    const token = getToken();
    const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_UPDATE_USER(userId)}`, { 
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
};

export const updateAvatarAdmin = async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken(); 

    return await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_UPDATE_AVATAR(userId)}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData,
    }).then(res => res.json()); 
};

export const deleteUser = async (userId) => {
    // Dùng httpClient cho nhất quán với lúc nãy bạn viết
    const response = await httpClient.delete(API.ADMIN_DELETE_USER(userId), {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    return response.data; 
};