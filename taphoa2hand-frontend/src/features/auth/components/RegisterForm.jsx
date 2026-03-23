// src/features/auth/components/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

const RegisterForm = () => {
    // 1. Cập nhật state khớp chính xác với UserCreateRequest DTO
    const [formData, setFormData] = useState({
        fullName: '',    // Thêm Full Name
        username: '',
        phone: '',       // Thêm Phone
        email: '',
        password: '',
        dob: '',         // Thêm Date of Birth (format: YYYY-MM-DD)
        roles: [],       // Vẫn giữ mảng rỗng như cũ
    });
    
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Kiểm tra mật khẩu khớp ở FE
        if (formData.password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setSubmitting(true);

        try {
            // Gọi API đăng ký
            await authApi.register(formData);
            
            alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login'); 
        } catch (err) {
            // Backend của bạn dùng Validation (NotBlank, Size, Email, DobConstraint)
            // Lỗi trả về thường nằm trong err.message hoặc cấu trúc lỗi cụ thể của bạn.
            setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setSubmitting(false);
        }
    };

    // CSS styles nội bộ (bạn có thể chuyển ra file .css sau)
    const styles = {
        container: { maxWidth: '450px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' },
        row: { display: 'flex', gap: '10px', marginBottom: '15px' },
        col: { flex: 1 },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: '500' },
        input: { width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' },
        button: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
        error: { color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }
    };

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Đăng ký tài khoản</h2>
            
            {error && <div style={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Họ và tên *</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        minLength={3}
                        maxLength={50}
                        placeholder="Nhập họ và tên thật"
                        style={styles.input}
                    />
                </div>

                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Tên đăng nhập *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            minLength={3}
                            maxLength={50}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Không bắt buộc"
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={styles.col}>
                        <label style={styles.label}>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.col}>
                        <label style={styles.label}>Ngày sinh *</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Mật khẩu *</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        style={styles.input}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Xác nhận mật khẩu *</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <button 
                    type="submit" 
                    style={styles.button}
                    disabled={submitting}
                >
                    {submitting ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
            </form>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                Đã có tài khoản? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Đăng nhập ngay</Link>
            </div>
        </div>
    );
};

export default RegisterForm;