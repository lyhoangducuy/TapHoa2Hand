// src/routes/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AuthPage from '../pages/AuthPage';
import { useAuth } from '../app/AuthProvider';

// Component để bảo vệ các route cần đăng nhập (Private Route)
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        // Nếu chưa đăng nhập, chuyển hướng về trang login
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Component để chặn user đã đăng nhập vào lại trang login/register (Restricted Route)
const RestrictedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (isAuthenticated) {
        // Nếu đã đăng nhập, chuyển hướng về trang chủ
        return <Navigate to="/" replace />;
    }
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />

            {/* Restricted Routes (Chỉ cho khách, đã ĐN thì không vào được) */}
            <Route 
                path="/login" 
                element={
                    <RestrictedRoute>
                        <AuthPage />
                    </RestrictedRoute>
                } 
            />
            <Route 
                path="/register" 
                element={
                    <RestrictedRoute>
                        <AuthPage />
                    </RestrictedRoute>
                } 
            />

            {/* Private Routes (Ví dụ: Trang Profile, cần bảo vệ) */}
            {/* Tạm thời cmt vì chưa có ProfilePage
            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        <div>Trang Profile (Chỉ nhìn thấy khi đã đăng nhập)</div>
                    </ProtectedRoute>
                } 
            />
            */}

            {/* 404 Not Found - Chuyển về trang chủ hoặc tạo Page riêng */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;