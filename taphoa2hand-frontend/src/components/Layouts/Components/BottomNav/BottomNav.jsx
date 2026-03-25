import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './BottomNav.module.scss';
import { FiHome, FiFileText, FiPlus, FiMessageSquare, FiUser } from 'react-icons/fi';
import { getMyInfo } from "../../../../services/userService";
import { getToken } from "../../../../services/localStorageService";

const cx = classNames.bind(styles);

function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    // Lấy thông tin user để hiển thị Avatar thay cho icon User
    useEffect(() => {
        const fetchUser = async () => {
            const token = getToken();
            if (token) {
                try {
                    const res = await getMyInfo();
                    if (res.data.code === 1000) setUser(res.data.result);
                } catch { setUser(null); }
            }
        };
        fetchUser();
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <div className={cx('bottom-nav')}>
            
            <div className={cx('nav-item', { active: isActive('/') })} onClick={() => navigate('/')}>
                <FiHome className={cx('icon')} />
                <span>Trang chủ</span>
            </div>
            
            <div className={cx('nav-item', { active: isActive('/manage') })} onClick={() => navigate('/manage')}>
                <FiFileText className={cx('icon')} />
                <span>Quản lý tin</span>
            </div>

            {/* Nút Đăng tin lồi lên */}
            <div className={cx('nav-item', 'post-btn-wrapper')} onClick={() => navigate('/post')}>
                <div className={cx('post-btn-circle')}>
                    <FiPlus className={cx('plus-icon')} />
                </div>
                <span className={cx('post-text')}>Đăng tin</span>
            </div>

            <div className={cx('nav-item', { active: isActive('/contact') })} onClick={() => navigate('/contact')}>
                <FiMessageSquare className={cx('icon')} />
                <span>Liên hệ</span>
            </div>
            
            {/* Nút Tài khoản: Bấm vào chuyển sang trang Profile/Account */}
            <div className={cx('nav-item', { active: isActive('/profile') })} onClick={() => navigate(user ? '/profile' : '/login')}>
                {user ? (
                    <div className={cx('avatar-nav')}>
                        {user.avatar ? <img src={user.avatar} alt="AVT" /> : <FiUser className={cx('icon')} />}
                    </div>
                ) : (
                    <FiUser className={cx('icon')} />
                )}
                <span>Tài khoản</span>
            </div>

        </div>
    );
}

export default BottomNav;