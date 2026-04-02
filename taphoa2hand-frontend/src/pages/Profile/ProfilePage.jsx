import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProfilePage.module.scss';
import { getMyInfo } from '../../services/userService';
import { removeToken } from '../../services/localstorageService';
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
    FiEdit3, FiShield, FiHeart, FiPackage, FiLogOut, FiChevronRight, FiLoader
} from 'react-icons/fi';

const cx = classNames.bind(styles);

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const navigate = useNavigate();

    const fileInputRef = useRef(null);

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

    const handleEditAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh!');
            return;
        }

        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/user/update-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.code === 1000) {
                setUser(prev => ({ ...prev, avatar: data.result.avatar }));
            } else {
                alert("Lỗi cập nhật ảnh: " + data.message);
            }
        } catch (error) {
            console.error("Lỗi upload avatar:", error);
            alert("Đã xảy ra lỗi khi tải ảnh lên máy chủ.");
        } finally {
            setUploadingAvatar(false);
            event.target.value = null;
        }
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
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <button
                            className={cx('edit-avatar-btn')}
                            onClick={handleEditAvatarClick}
                            disabled={uploadingAvatar}
                        >
                            {uploadingAvatar ? <FiLoader className={cx('spin')} /> : <FiEdit3 />}
                        </button>
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

                {/* 2. Menu Quick Links (Tiện ích) */}
                <div className={cx('menu-list')}>
                    <div className={cx('menu-item')} onClick={() => navigate('/my-orders')}>
                        <div className={cx('item-left')}>
                            <FiPackage className={cx('item-icon')} />
                            <span>Đơn hàng của tôi</span>
                        </div>
                        <FiChevronRight className={cx('item-arrow')} />
                    </div>
                    <div className={cx('menu-item')} onClick={() => navigate('/favorites')}>
                        <div className={cx('item-left')}>
                            <FiHeart className={cx('item-icon')} />
                            <span>Đã thích</span>
                        </div>
                        <FiChevronRight className={cx('item-arrow')} />
                    </div>
                    <div className={cx('menu-item')} onClick={() => navigate('/settings')}>
                        <div className={cx('item-left')}>
                            <FiUser className={cx('item-icon')} />
                            <span>Cài đặt tài khoản</span>
                        </div>
                        <FiChevronRight className={cx('item-arrow')} />
                    </div>
                </div>

                <hr className={cx('divider')} />

                {/* 3. Details Section (Thông tin chi tiết) */}
                <div className={cx('details-section')}>
                    <h3 className={cx('section-title')}>Thông tin liên hệ</h3>

                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}>
                            <FiMail />
                        </div>
                        <div className={cx('detail-content')}>
                            <span className={cx('detail-label')}>Email</span>
                            <span className={cx('detail-value')}>{user.email || 'Chưa cập nhật'}</span>
                        </div>
                    </div>

                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}>
                            <FiPhone />
                        </div>
                        <div className={cx('detail-content')}>
                            <span className={cx('detail-label')}>Số điện thoại</span>
                            <span className={cx('detail-value')}>{user.phone || 'Chưa cập nhật'}</span>
                        </div>
                    </div>

                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}>
                            <FiMapPin />
                        </div>
                        <div className={cx('detail-content')}>
                            <span className={cx('detail-label')}>Địa chỉ</span>
                            <span className={cx('detail-value')}>{user.address || 'Chưa cập nhật'}</span>
                        </div>
                    </div>

                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}>
                            <FiCalendar />
                        </div>
                        <div className={cx('detail-content')}>
                            <span className={cx('detail-label')}>Ngày tham gia</span>
                            <span className={cx('detail-value')}>
                                {/* Parse ngày tháng nếu backend trả về, nếu không thì để mặc định */}
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Footer Section */}
                <div className={cx('footer-section')}>
                    <button
                        className={cx('edit-profile-btn')}
                        onClick={() => navigate('/edit-profile')} // THÊM DÒNG NÀY (Đổi đường dẫn tùy file route của ông)
                    >
                        CHỈNH SỬA HỒ SƠ
                    </button>
                    <button className={cx('logout-btn')} onClick={handleLogout}>
                        <FiLogOut /> ĐĂNG XUẤT
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;