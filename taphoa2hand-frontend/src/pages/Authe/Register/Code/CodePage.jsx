import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CodePage.module.scss'; 
import { FiArrowLeft, FiShield } from 'react-icons/fi';
// Import 2 hàm API ông vừa viết (Nhớ chỉnh lại đường dẫn cho đúng với project của ông nhé)
import { sendCode,reSendCode } from '../../../../services/authenticationService';

const cx = classNames.bind(styles);

function CodePage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Hứng email từ trang Đăng ký truyền sang. Nếu không có thì để rỗng.
    const email = location.state?.email || ''; 

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Kiểm tra xem có email không, nếu không có thì báo lỗi bắt quay lại
    useEffect(() => {
        if (!email) {
            setErrorMsg('Không tìm thấy thông tin email. Vui lòng quay lại trang đăng ký!');
        }
    }, [email]);

    const handleChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 6) {
            setCode(value);
            setErrorMsg('');
            setSuccessMsg('');
        }
    };

    // XỬ LÝ BẤM NÚT "XÁC NHẬN"
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        if (code.length < 6) {
            setErrorMsg('Vui lòng nhập đủ 6 số xác nhận!');
            return;
        }

        setLoading(true);
        try {
            // Gọi hàm API ông đã viết
            const response = await sendCode(email, code);
            const data = await response.json();

            // Check kết quả theo cấu trúc ApiResponse của Backend ông
            // { result: { success: true/false } }
            if (data.result && data.result.success) {
                setSuccessMsg('Xác nhận thành công! Đang chuyển hướng...');
                setTimeout(() => {
                    navigate('/login'); // Xác nhận xong đẩy qua đăng nhập
                }, 1500);
            } else {
                setErrorMsg('Mã xác nhận không hợp lệ hoặc đã hết hạn.');
            }
        } catch (error) {
            setErrorMsg('Có lỗi xảy ra khi kết nối tới máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    // XỬ LÝ BẤM CHỮ "GỬI LẠI MÁ"
    const handleResend = async (e) => {
        e.preventDefault();
        if (!email || isResending) return;

        setIsResending(true);
        setErrorMsg('');
        try {
            const response = await reSendCode(email);
            const data = await response.json();

            if (data.result && data.result.success) {
                setSuccessMsg('Đã gửi lại mã xác nhận mới vào email của bạn!');
            } else {
                setErrorMsg('Không thể gửi lại mã lúc này. Thử lại sau!');
            }
        } catch (error) {
            setErrorMsg('Có lỗi kết nối khi gửi lại mã.');
        } finally {
            // Khóa nút gửi lại khoảng 5s để chống spam click
            setTimeout(() => setIsResending(false), 5000); 
        }
    };

    return ( 
        <div className={cx('wrapper')}>
            <div className={cx('verify-card')}>
                <button className={cx('back-btn')} onClick={() => navigate(-1)}>
                    <FiArrowLeft />
                </button>

                <div className={cx('header')}>
                    <div className={cx('icon-wrapper')}>
                        <FiShield className={cx('shield-icon')} />
                    </div>
                    <h2 className={cx('title')}>Xác thực Email</h2>
                    <p className={cx('subtitle')}>
                        Nhập mã xác nhận 6 chữ số vừa được gửi tới email <b>{email || 'của bạn'}</b>.
                    </p>
                </div>

                {/* Hiện thông báo lỗi hoặc thành công */}
                {errorMsg && <div className={cx('error-message')}>{errorMsg}</div>}
                {successMsg && <div className={cx('error-message')} style={{background: '#e8f8f5', color: '#27ae60', borderColor: '#d1f2eb'}}>{successMsg}</div>}

                <form className={cx('form')} onSubmit={handleSubmit}>
                    <div className={cx('input-group')}>
                        <input 
                            type="text" 
                            className={cx('otp-input')}
                            placeholder="0 0 0 0 0 0" 
                            value={code} 
                            onChange={handleChange} 
                            maxLength={6}
                            disabled={!email || loading}
                            autoFocus
                            required 
                        />
                    </div>

                    <button type="submit" className={cx('submit-btn')} disabled={loading || code.length !== 6 || !email}>
                        {loading ? 'ĐANG KIỂM TRA...' : 'XÁC NHẬN'}
                    </button>
                </form>

                <p className={cx('resend-hint')}>
                    Không nhận được mã?{' '}
                    <span 
                        className={cx('resend-link')} 
                        onClick={handleResend}
                        style={{ cursor: isResending ? 'not-allowed' : 'pointer', opacity: isResending ? 0.5 : 1 }}
                    >
                        {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default CodePage;