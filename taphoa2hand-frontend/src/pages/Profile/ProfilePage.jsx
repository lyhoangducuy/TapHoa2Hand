import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProfilePage.module.scss';
import { getMyInfo } from '../../services/userService';
import { removeToken } from '../../services/localStorageService';
import { 
    FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, 
    FiEdit3, FiShield, FiHeart, FiPackage, FiLogOut, FiChevronRight 
} from 'react-icons/fi';

const cx = classNames.bind(styles);

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getMyInfo();
                if (response.data.code === 1000) {
                    setUser(response.data.result);
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin cá nhân:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        removeToken();
        navigate('/');
        window.location.reload();
    };

    if (loading) return <div className={cx('loading')}>Đang tải thông tin...</div>;
    if (!user) return <div className={cx('error')}>Vui lòng đăng nhập để xem thông tin.</div>;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('profile-card')}>
                {/* 1. Header Section */}
                <div className={cx('header-section')}>
                    <div className={cx('avatar-container')}>
                        <img 
                            src={user.avatar || 'https://via.placeholder.com/150'} 
                            alt="Avatar" 
                            className={cx('avatar')}
                        />
                        <button className={cx('edit-avatar-btn')}><FiEdit3 /></button>
                    </div>
                    <div className={cx('basic-info')}>
                        <h2 className={cx('full-name')}>{user.fullName || 'Người dùng'}</h2>
                        <p className={cx('username')}>@{user.username}</p>
                        <div className={cx('role-tags')}>
                            {user.roles?.map((role, index) => (
                                <span key={index} className={cx('role-badge')}>
                                    <FiShield /> {role.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <hr className={cx('divider')} />

                {/* 2. Menu Quick Links (Mới thêm cho Mobile/Desktop) */}
                <div className={cx('menu-list')}>
                    <h3 className={cx('section-title')}>Tiện ích của tôi</h3>
                    
                    <div className={cx('menu-item')} onClick={() => navigate('/favorites')}>
                        <div className={cx('item-left')}>
                            <FiHeart className={cx('icon-heart')} />
                            <span>Tin đã yêu thích</span>
                        </div>
                        <FiChevronRight className={cx('chevron')} />
                    </div>

                    <div className={cx('menu-item')} onClick={() => navigate('/my-orders')}>
                        <div className={cx('item-left')}>
                            <FiPackage className={cx('icon-package')} />
                            <span>Lịch sử đơn hàng</span>
                        </div>
                        <FiChevronRight className={cx('chevron')} />
                    </div>
                </div>

                <hr className={cx('divider')} />

                {/* 3. Details Section */}
<div className={cx('details-section')}>
    <h3 className={cx('section-title')}>Thông tin cá nhân</h3>
    
    <div className={cx('info-item')}>
        <div className={cx('icon')}><FiMail /></div>
        <div className={cx('content')}>
            <label>Email</label>
            <p>{user.email || 'Chưa cập nhật'}</p>
        </div>
    </div>
    <div className={cx('info-item')}>
        <div className={cx('icon')}><FiPhone /></div>
        <div className={cx('content')}>
            <label>Số điện thoại</label>
            <p>{user.phone || 'Chưa cập nhật'}</p>
        </div>
    </div>
    <div className={cx('info-item')}>
        <div className={cx('icon')}><FiMapPin /></div>
        <div className={cx('content')}>
            <label>Địa chỉ</label>
            <p>{user.address || 'Chưa cập nhật'}</p>
        </div>
    </div>
    {/* Ông có thể bổ sung thêm Ngày sinh vào đây cho đủ 4 block cho đẹp */}
    <div className={cx('info-item')}>
        <div className={cx('icon')}><FiCalendar /></div>
        <div className={cx('content')}>
            <label>Ngày sinh</label>
            <p>{user.dob || 'Chưa cập nhật'}</p>
        </div>
    </div>
</div>

                {/* 4. Footer Section */}
                <div className={cx('footer-section')}>
                    <button className={cx('edit-profile-btn')}>CHỈNH SỬA HỒ SƠ</button>
                    <button className={cx('logout-btn')} onClick={handleLogout}>
                        <FiLogOut /> ĐĂNG XUẤT
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;