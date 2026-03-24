import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './LoginPage.module.scss';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '../../services/authenticationService'; // Điều chỉnh đường dẫn file login của bạn
import { setToken } from '../../services/localstorageService';

const cx = classNames.bind(styles);

function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    
    // State lưu thông tin đăng nhập
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const togglePassword = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(''); // Reset lỗi cũ

        try {
            const response = await login(username, password);
            const data = await response.json();

            // Check chuẩn ApiResponse: code 1000 là thành công
            if (data.code === 1000 && data.result.authenticated) {
                // Lưu token vào localStorage
                setToken(data.result.token);
                
                // Đăng nhập xong thì bay về trang chủ
                navigate('/'); 
                // Có thể dùng window.location.reload() nếu bạn muốn Header cập nhật ngay lập tức
                window.location.reload();
            } else {
                setErrorMsg('Tên đăng nhập hoặc mật khẩu không đúng!');
            }
        } catch (error) {
            console.error("Login Error:", error);
            setErrorMsg('Đã có lỗi xảy ra, vui lòng thử lại sau.');
        }
    };

    return (
        <div className={cx('login-page')}>
            <div className={cx('login-container')}>
                <div className={cx('header')}>
                    <h1 className={cx('logo-text')}>TapHoa<span className={cx('highlight')}>2Hand</span></h1>
                    <p className={cx('subtitle')}>Chào mừng bạn quay trở lại!</p>
                </div>

                <form className={cx('form')} onSubmit={handleSubmit}>
                    {/* Hiển thị thông báo lỗi nếu có */}
                    {errorMsg && <p className={cx('error-text')}>{errorMsg}</p>}

                    <div className={cx('input-group')}>
                        <label>Tên đăng nhập </label>
                        <div className={cx('input-wrapper')}>
                            <FiMail className={cx('icon')} />
                            <input 
                                type="text" 
                                placeholder="Nhập username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={cx('input-group')}>
                        <label>Mật khẩu</label>
                        <div className={cx('input-wrapper')}>
                            <FiLock className={cx('icon')} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Nhập mật khẩu" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="button" className={cx('eye-btn')} onClick={togglePassword}>
                                {showPassword ? <FiEye /> : <FiEyeOff />}
                            </button>
                        </div>
                    </div>

                    <div className={cx('form-actions')}>
                        <label className={cx('remember-me')}>
                            <input type="checkbox" />
                            <span>Ghi nhớ tài khoản</span>
                        </label>
                        <a href="#" className={cx('forgot-password')}>Quên mật khẩu?</a>
                    </div>

                    <button type="submit" className={cx('submit-btn')}>
                        ĐĂNG NHẬP
                    </button>
                </form>

                <div className={cx('register-link')}>
                    <span>Bạn chưa có tài khoản? </span>
                    <a href="#">Đăng ký ngay</a>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;