import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './RegisterPage.module.scss';
import {
    FiUser, FiMail, FiLock, FiPhone,
    FiCalendar, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle
} from 'react-icons/fi';

const cx = classNames.bind(styles);

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        dob: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrorMsg(''); // Xóa lỗi khi người dùng bắt đầu nhập lại
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validate sương sương ở Frontend
        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        setErrorMsg(''); // Reset lỗi trước khi gọi

        try {
            // 2. GỌI API THẬT XUỐNG BACKEND
            const response = await fetch('http://localhost:8080/auth/register', { // Sửa lại URL cho đúng với config của ông
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword, // Tùy backend của ông có cần gửi không
                    email: formData.email,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    dob: formData.dob // type="date" sẽ trả về "YYYY-MM-DD", Spring Boot nhận tốt
                }),
            });

            const data = await response.json();

            // 3. Xử lý kết quả trả về
            if (response.ok) { // Status 200 - 299
                setLoading(false);
                // Đăng ký thành công, đẩy qua trang nhập code và truyền email theo state
                navigate('/send-code', { state: { email: formData.email } }); 
            } else {
                // Backend báo lỗi (Trùng email, trùng username...)
                setLoading(false);
                setErrorMsg(data.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại!');
            }

        } catch (error) {
            setLoading(false);
            console.error('Lỗi khi gọi API:', error);
            setErrorMsg('Không thể kết nối đến máy chủ!');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('register-card')}>
                <button className={cx('back-btn')} onClick={() => navigate('/login')}>
                    <FiArrowLeft />
                </button>

                <div className={cx('header')}>
                    <h1 className={cx('title')}>Tạo tài khoản mới</h1>
                </div>

                {errorMsg && <div className={cx('error-message')}>{errorMsg}</div>}

                <form className={cx('form')} onSubmit={handleSubmit}>

                    {/* HÀNG 1: Họ tên + Username */}
                    <div className={cx('input-row')}>
                        <div className={cx('input-group')}>
                            <label>Họ và Tên</label>
                            <div className={cx('input-wrapper')}>
                                <FiUser className={cx('input-icon')} />
                                <input
                                    type="text" name="fullName" placeholder="VD: Nguyễn Văn A"
                                    value={formData.fullName} onChange={handleChange} required minLength={3} maxLength={50}
                                />
                            </div>
                        </div>

                        <div className={cx('input-group')}>
                            <label>Tên đăng nhập</label>
                            <div className={cx('input-wrapper')}>
                                <FiCheckCircle className={cx('input-icon')} />
                                <input
                                    type="text" name="username" placeholder="VD: nguyenvana123"
                                    value={formData.username} onChange={handleChange} required minLength={3} maxLength={50}
                                />
                            </div>
                        </div>
                    </div>

                    {/* HÀNG 2: Email (Full ngang) */}
                    <div className={cx('input-group')}>
                        <label>Email</label>
                        <div className={cx('input-wrapper')}>
                            <FiMail className={cx('input-icon')} />
                            <input
                                type="email" name="email" placeholder="Nhập địa chỉ email"
                                value={formData.email} onChange={handleChange} required
                            />
                        </div>
                    </div>

                    {/* HÀNG 3: SĐT + Ngày sinh */}
                    <div className={cx('input-row')}>
                        <div className={cx('input-group')}>
                            <label>Số điện thoại</label>
                            <div className={cx('input-wrapper')}>
                                <FiPhone className={cx('input-icon')} />
                                <input
                                    type="tel" name="phone" placeholder="Nhập số điện thoại"
                                    value={formData.phone} onChange={handleChange} required
                                />
                            </div>
                        </div>

                        <div className={cx('input-group')}>
                            <label>Ngày sinh (Trên 15 tuổi)</label>
                            <div className={cx('input-wrapper')}>
                                <FiCalendar className={cx('input-icon')} />
                                <input
                                    type="date" name="dob"
                                    value={formData.dob} onChange={handleChange} required
                                />
                            </div>
                        </div>
                    </div>

                    {/* HÀNG 4: Password + Confirm Password */}
                    <div className={cx('input-row')}>
                        <div className={cx('input-group')}>
                            <label>Mật khẩu</label>
                            <div className={cx('input-wrapper')}>
                                <FiLock className={cx('input-icon')} />
                                <input
                                    type={showPassword ? "text" : "password"} name="password" placeholder="Tối thiểu 6 ký tự"
                                    value={formData.password} onChange={handleChange} required minLength={6}
                                />
                                <button type="button" className={cx('toggle-pw-btn')} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className={cx('input-group')}>
                            <label>Xác nhận mật khẩu</label>
                            <div className={cx('input-wrapper')}>
                                <FiLock className={cx('input-icon')} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword} onChange={handleChange} required minLength={6}
                                />
                                <button type="button" className={cx('toggle-pw-btn')} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className={cx('submit-btn')} disabled={loading}>
                        {loading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
                    </button>
                </form>

                <p className={cx('login-hint')}>
                    Đã có tài khoản? <span className={cx('login-link')} onClick={() => navigate('/login')}>Đăng nhập</span>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;