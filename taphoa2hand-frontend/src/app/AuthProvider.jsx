// src/app/AuthProvider.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../features/auth/api/authApi';

// Tạo Context
const AuthContext = createContext(null);

// Provider Component bọc toàn bộ App
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Lưu thông tin user
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Trạng thái ĐN
    const [isLoading, setIsLoading] = useState(true); // Trạng thái đang tải data

    // Hàm kiểm tra trạng thái đăng nhập khi App mới load
    const checkAuthStatus = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // Gọi API /user/myInfo để lấy thông tin user
            const userData = await authApi.getMyInfo();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            // Token sai hoặc hết hạn
            console.error('Lỗi xác thực:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Chạy 1 lần duy nhất khi App mounted
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Hàm xử lý logic Login thành công
    const login = (authResponse) => {
        // Lưu token từ API trả về vào localStorage
        localStorage.setItem('access_token', authResponse.token);
        localStorage.setItem('refresh_token', authResponse.refreshToken);
        
        // Tùy logic backend, nếu login() trả về cả thông tin user
        // thì set ở đây. Nếu không, gọi lại API getMyInfo().
        // Ở backend của bạn, AuthenticationResponse chỉ có token.
        // Nên ta cần gọi checkAuthStatus() để lấy user data.
        checkAuthStatus();
    };

    // Hàm xử lý logic Logout
    const logout = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                // Gọi API backend /auth/logout để vô hiệu hóa token (Blacklist Redis)
                await authApi.logout({ token });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Luôn xóa token ở FE bất kể API có thành công hay không
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Giá trị cung cấp cho các component con
    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children} {/* Chỉ render app khi đã kiểm tra xong auth */}
        </AuthContext.Provider>
    );
};

// Custom Hook để các component khác dùng data dễ dàng
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};