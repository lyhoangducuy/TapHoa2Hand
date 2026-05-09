// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
// Lightweight JWT decode helper (no dependency) — only parses payload
const decodeJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        throw new Error('Invalid token');
    }
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    // 1. Lấy token từ LocalStorage
    const token = localStorage.getItem('token');
    
    // Kiểm tra 1: Chưa có token -> Đá văng về trang Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // Giải mã token để lấy thông tin bên trong (giống y hệt cái bạn thấy trên Postman)
        const decodedToken = decodeJwt(token); 

        // Kiểm tra 2: Đã đăng nhập, nhưng Route yêu cầu quyền Admin mà scope lại không phải ROLE_ADMIN
        if (requireAdmin && decodedToken.scope !== 'ROLE_ADMIN') {
            // Đá văng về trang chủ
            return <Navigate to="/" replace />; 
        }

        // Tùy chọn nâng cao: Bạn có thể check luôn hạn sử dụng (exp) của token ở đây nếu muốn!
        // const currentTime = Date.now() / 1000;
        // if (decodedToken.exp < currentTime) { return <Navigate to="/login" replace />; }

        // Vượt qua hết ải -> Cho phép vào
        return children;

    } catch (error) {
        // Nếu token bị lỗi, bị chỉnh sửa bậy bạ khiến hàm giải mã bị lỗi -> Bắt đăng nhập lại
        console.error("Lỗi giải mã token:", error);
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;