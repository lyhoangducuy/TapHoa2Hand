// src/features/auth/api/authApi.js
import axiosClient from '../../../api/axiosClient';

export const authApi = {
    // 1. Khớp với @PostMapping("/log-in") trong AuthenticationController
    // Nhận: { username, password }
    // Trả về: AuthenticationResponse { token, refreshToken, authenticated }
    login: (credentials) => {
        return axiosClient.post('/auth/log-in', credentials);
    },
    
    // 2. Khớp với @PostMapping("/logout") trong AuthenticationController
    // Nhận: { token }
    logout: (logoutRequest) => {
        return axiosClient.post('/auth/logout', logoutRequest);
    },

    // 3. Khớp với @PostMapping("/create") trong UsersController (Dùng cho Đăng ký)
    // Nhận: UserCreateRequest { username, email, password, roles: [] }
    // Trả về: UserResponse
    register: (userData) => {
        return axiosClient.post('/user/create', userData);
    },

    // 4. Khớp với @GetMapping("/myInfo") trong UsersController
    // Trả về: UserResponse (cần token hợp lệ trong header)
    getMyInfo: () => {
        return axiosClient.get('/user/myInfo');
    }
};