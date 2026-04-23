import { API, CONFIG } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

export const getAllPosts = async () => {
    try {
        const response = await httpClient.get(API.GET_POST);
        // Vì Backend trả về ApiResponse { code, message, result }
        // Chúng ta trả về response.data để lấy đúng object đó
        return response.data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};
export const getPostDetail = async (postId) => {
    try {
        // Sử dụng hàm DETAIL_POST từ configuration của bạn
        const response = await httpClient.get(API.DETAIL_POST(postId));
        return response.data; 
    } catch (error) {
        console.error(`Error fetching post detail for ID ${postId}:`, error);
        throw error;
    }
};

export const createPost = async (postData, images) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Ép kiểu JSON thành Blob để Spring Boot @RequestPart có thể đọc được
        formData.append(
            "request", 
            new Blob([JSON.stringify(postData)], { type: "application/json" })
        );

        if (images && images.length > 0) {
            Array.from(images).forEach((image) => {
                formData.append("images", image);
            });
        }

        const response = await httpClient.post(API.CREATE_POST, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                // Ép Axios gửi dưới dạng Form Data
                "Content-Type": "multipart/form-data" 
            }
        });
        
        return response.data;
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};
export const deletePost = async (postId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.delete(API.DELETE_POST(postId), {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting post with ID ${postId}:`, error);
        throw error;
    }
};
export const editPost = async (postId, postData, images) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append(
            "request", 
            new Blob([JSON.stringify(postData)], { type: "application/json" })
        );
        if (images && images.length > 0) {
            Array.from(images).forEach((image) => {
                formData.append("images", image);
            });
        }
        const response = await httpClient.put(API.EDIT_POST(postId), formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error editing post with ID ${postId}:`, error);
        throw error;
    }
};
export const searchPosts = async (keyword, location, categoryId, page = 0, size = 10) => {
    try {
        const params = { page, size }; // Spring nhận page từ 0
        if (keyword) params.keyword = keyword;
        if (location) params.location = location;
        if (categoryId) params.categoryId = categoryId;

        const response = await httpClient.get(`${API.SEARCH}`, { params });
        
        return response.data; 
    } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
        throw error;
    }
};
// =========================================================
// CÁC API DÀNH CHO ADMIN QUẢN LÝ BÀI VIẾT (POSTS)
// =========================================================

export const adminGetAllPosts = async (page = 0, size = 10) => {
    try {
        const token = localStorage.getItem('token');
        // Đã bỏ CONFIG.API_GATEWAY đi vì httpClient tự động nối Base URL
        const response = await httpClient.get(`${API.ADMIN_GET_POSTS}?page=${page}&size=${size}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi Admin lấy danh sách bài viết:", error);
        throw error;
    }
};

export const adminGetPostDetail = async (postId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(API.ADMIN_GET_POST_DETAIL(postId), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; 
    } catch (error) {
        console.error(`Lỗi khi Admin lấy chi tiết bài viết ID ${postId}:`, error);
        throw error;
    }
};

export const adminCreatePost = async (postData, images) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Ép kiểu JSON thành Blob để Spring Boot @RequestPart có thể đọc được
        formData.append(
            "request", 
            new Blob([JSON.stringify(postData)], { type: "application/json" })
        );

        if (images && images.length > 0) {
            Array.from(images).forEach((image) => {
                formData.append("images", image);
            });
        }

        const response = await httpClient.post(API.ADMIN_CREATE_POST, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data" 
            }
        });
        
        return response.data;
    } catch (error) {
        console.error("Lỗi khi Admin tạo bài viết:", error);
        throw error;
    }
};

export const adminUpdatePost = async (postId, postData, images) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        
        formData.append(
            "request", 
            new Blob([JSON.stringify(postData)], { type: "application/json" })
        );

        if (images && images.length > 0) {
            Array.from(images).forEach((image) => {
                formData.append("images", image);
            });
        }

        const response = await httpClient.put(API.ADMIN_UPDATE_POST(postId), formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi Admin cập nhật bài viết ID ${postId}:`, error);
        throw error;
    }
};

export const adminDeletePost = async (postId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.delete(API.ADMIN_DELETE_POST(postId), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi Admin xóa bài viết ID ${postId}:`, error);
        throw error;
    }
};
export const getCheckAI = async (postId) => {
    try {
        const token = localStorage.getItem('token');
        
        // Thêm {} vào giữa URL và phần config
        const response = await httpClient.post(API.GET_CHECK_AI(postId), {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy check AI bài viết ID ${postId}:`, error);
        throw error;
    }
};
export const getMyPosts = async (page = 0, size = 10) => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(API.GET_MYPOST, {
            params: {
                page: page,
                size: size
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // Trả về toàn bộ response.data để component tự bóc tách ApiResponse
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy bài viết của tôi:", error);
        throw error;
    }
};