// src/api/axiosClient.js
import axios from 'axios';

// 1. Tạo instance của Axios với cấu hình cơ bản
const axiosClient = axios.create({
    // URL gốc của Backend Spring Boot
    baseURL: 'http://localhost:8080', // Cập nhật port/path đúng của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor cho Request: Gắn Access Token vào Header trước khi gửi request
axiosClient.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('access_token');
        if (token) {
            // Gắn vào header theo chuẩn Bearer
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Interceptor cho Response: Xử lý lỗi tập trung (ví dụ: Token hết hạn - 401)
axiosClient.interceptors.response.use(
    (response) => {
        // Backend của bạn bọc data trong trường "result" của ApiResponse
        // Chúng ta bóc tách nó ở đây để UI dùng tiện hơn.
        if (response.data && response.data.result) {
            return response.data.result;
        }
        return response.data;
    },
    (error) => {
        // Xử lý lỗi toàn cục
        if (error.response) {
            // Ví dụ: Nếu nhận lỗi 401 (Unauthenticated)
            if (error.response.status === 401) {
                // Có thể xử lý logout hoặc refresh token ở đây (phần nâng cao)
                // Tạm thời xóa token cũ
                localStorage.removeItem('access_token');
                // Tùy chọn: chuyển hướng về trang login
                // window.location.href = '/login';
            }
            // Trả về message lỗi từ backend (AppException)
            return Promise.reject(error.response.data);
        }
        return Promise.reject({ message: 'Lỗi mạng hoặc server không phản hồi.' });
    }
);

export default axiosClient;