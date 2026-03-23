// src/pages/AuthPage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';

const AuthPage = () => {
    const location = useLocation();
    
    // Kiểm tra path hiện tại để quyết định render Form nào
    const isLoginPage = location.pathname === '/login';

    return (
        <div style={{ padding: '20px' }}>
            {isLoginPage ? <LoginForm /> : <RegisterForm />}
        </div>
    );
};

export default AuthPage;