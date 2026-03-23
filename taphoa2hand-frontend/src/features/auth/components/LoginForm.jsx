// src/features/auth/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../../../app/AuthProvider';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth(); // Lấy hàm login từ Context

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // 1. Gọi API login
            const authResponse = await authApi.login(formData);
            
            // 2. Cập nhật state toàn cục (lưu token, lấy user info)
            login(authResponse);
            
            // 3. Chuyển hướng về trang chủ
            alert('Đăng nhập thành công!');
            navigate('/'); 
        } catch (err) {
            // Hiển thị lỗi từ backend (ApiResponse trả về dữ liệu lỗi)
            setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
        } finally {
            setSubmitting(false);
        }
    };

    // Style đơn giản để test
    const styles = {
        container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px' },
        input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
        button: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        error: { color: 'red', marginBottom: '15px' }
    };

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: 'center' }}>Đăng nhập</h2>
            
            {error && <div style={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Tên đăng nhập</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <button 
                    type="submit" 
                    style={styles.button}
                    disabled={submitting}
                >
                    {submitting ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
            </form>
            
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
        </div>
    );
};

export default LoginForm;