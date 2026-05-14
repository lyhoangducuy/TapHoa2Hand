import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProfilePage.module.scss';
import { getMyInfo } from '../../services/userService';
import { getMyPosts } from '../../services/postService'; // Gọi API lấy bài viết
import { removeToken } from '../../services/localstorageService';
import UserPosts from './Post/UserPosts'; // Import component con

import {
    FiMail, FiPhone, FiMapPin, FiCalendar,
    FiEdit3, FiShield, FiLogOut, FiLoader
} from 'react-icons/fi';

const cx = classNames.bind(styles);

function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    
    // State quản lý bài viết
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, postsResponse] = await Promise.all([
                    getMyInfo().catch(() => null),
                    getMyPosts(0, 10).catch(() => null)
                ]);

                if (userResponse?.data?.code === 1000) {
                    setUser(userResponse.data.result);
                }

                if (postsResponse?.code === 1000 && postsResponse.result) {
                    setPosts(postsResponse.result.content || []);
                    setTotalPages(postsResponse.result.totalPages || 1);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLoadMorePosts = async () => {
        const nextPage = currentPage + 1;
        if (nextPage >= totalPages) return;

        try {
            const response = await getMyPosts(nextPage, 10);
            if (response?.code === 1000 && response.result) {
                setPosts(prev => [...prev, ...(response.result.content || [])]);
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.error("Lỗi khi tải thêm bài viết:", error);
        }
    };

    const handleLogout = () => {
        removeToken();
        navigate('/');
        window.location.reload();
    };

    const handleEditAvatarClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
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
                headers: { 'Authorization': `Bearer ${token}` },
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
                <div className={cx('header-section')}>
                    <div className={cx('avatar-container')}>
                        <img src={user.avatar || 'https://via.placeholder.com/150'} alt="Avatar" className={cx('avatar')} />
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                        <button className={cx('edit-avatar-btn')} onClick={handleEditAvatarClick} disabled={uploadingAvatar}>
                            {uploadingAvatar ? <FiLoader className={cx('spin')} /> : <FiEdit3 />}
                        </button>
                    </div>

                    <div className={cx('basic-info')}>
                        <div className={cx('label-group')}>
                            <span className={cx('profile-badge')}>Hồ sơ của tôi</span>
                        </div>
                        <h2 className={cx('full-name')}>{user.fullName || 'Người dùng'}</h2>
                        <p className={cx('username')}>@{user.username}</p>
                        <div className={cx('role-tags')}>
                            {user.roles?.map((role, index) => (
                                <span key={index} className={cx('role-badge')}><FiShield /> {role.name}</span>
                            ))}
                        </div>

                        <div className={cx('stats-row')}>
                            <div className={cx('stat-item')}>
                                <strong>{posts.length}</strong>
                                <span>Bài đăng</span>
                            </div>
                            <div className={cx('stat-item')}>
                                <strong>{user.rating || '-'}</strong>
                                <span>Đánh giá</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className={cx('divider')} />

                <div className={cx('profile-actions')}>
                    <button className={cx('primary-action')} onClick={() => navigate('/edit-profile')}>
                        Chỉnh sửa hồ sơ
                    </button>
                    <button className={cx('secondary-action')} onClick={handleLogout}>
                        <FiLogOut /> Đăng xuất
                    </button>
                </div>

                <hr className={cx('divider')} />

                <div className={cx('details-section')}>
                    <h3 className={cx('section-title')}>Thông tin liên hệ</h3>
                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}><FiMail /></div>
                        <div className={cx('detail-content')}><span className={cx('detail-label')}>Email</span><span className={cx('detail-value')}>{user.email || 'Chưa cập nhật'}</span></div>
                    </div>
                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}><FiPhone /></div>
                        <div className={cx('detail-content')}><span className={cx('detail-label')}>Số điện thoại</span><span className={cx('detail-value')}>{user.phone || 'Chưa cập nhật'}</span></div>
                    </div>
                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}><FiMapPin /></div>
                        <div className={cx('detail-content')}><span className={cx('detail-label')}>Địa chỉ</span><span className={cx('detail-value')}>{user.address || 'Chưa cập nhật'}</span></div>
                    </div>
                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}><FiCalendar /></div>
                        <div className={cx('detail-content')}>
                            <span className={cx('detail-label')}>Ngày tham gia</span>
                            <span className={cx('detail-value')}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}</span>
                        </div>
                    </div>
                </div>

                <hr className={cx('divider')} />

                <div className={cx('my-posts-section')}>
                    <h3 className={cx('section-title')}>Bài đăng của tôi</h3>
                    <UserPosts 
                        posts={posts} 
                        onLoadMore={handleLoadMorePosts} 
                        hasMore={currentPage < totalPages - 1} 
                    />
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;