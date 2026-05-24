import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import {
    cilMenu, cilBell, cilEnvelopeOpen, cilUser,
    cilSettings, cilLockLocked, cilAccountLogout
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom';
import {
    FiBell, FiMessageSquare, FiUser, FiChevronDown,
    FiPackage, FiLogOut, FiHeart
} from 'react-icons/fi';
import { getMyInfo } from '../../../../services/userService';
import { getToken, removeToken } from '../../../../services/localstorageService';
import {
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead
} from '../../../../services/notificationService';
import {
    disconnectSocket,
    subscribeToNotifications,
    unsubscribeFromNotifications
} from '../../../../services/socketService';

const cx = classNames.bind(styles);

// Hàm format thời gian
const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Vừa xong';

    const now = new Date();
    const postDate = new Date(dateString);

    if (isNaN(postDate.getTime())) return 'Vừa xong';

    const diffInMs = now - postDate;
    const diffInSeconds = diffInMs / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;

    if (diffInSeconds < 60) {
        return `${Math.floor(diffInSeconds)} giây trước`;
    } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)} phút trước`;
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} giờ trước`;
    } else {
        return postDate.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// ─── Notification Dropdown (từ user Header) ───
const NotificationDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotificationsData = async () => {
        try {
            const [notiRes, countRes] = await Promise.all([
                getUserNotifications(user.id),
                getUnreadNotificationCount(user.id)
            ]);
            let notiData = notiRes.data?.result || notiRes.result || [];
            if (!Array.isArray(notiData) && notiData.id) notiData = [notiData];
            else if (!Array.isArray(notiData)) notiData = [];
            setNotifications(notiData);
            let countData = countRes.data?.result ?? countRes.result ?? 0;
            setUnreadCount(Number(countData));
        } catch (error) {
            console.error('Lỗi lấy thông báo:', error);
        }
    };

    useEffect(() => {
        if (user && user.id) {
            fetchNotificationsData();
            subscribeToNotifications((payload) => {
                let parsedData = payload;
                if (payload && payload.body) {
                    try { parsedData = JSON.parse(payload.body); }
                    catch (e) { console.error('Lỗi parse STOMP body', e); }
                } else if (typeof payload === 'string') {
                    try { parsedData = JSON.parse(payload); }
                    catch (e) { console.error('Lỗi parse JSON string', e); }
                }
                const newNoti = parsedData.result ? parsedData.result : parsedData;
                if (!newNoti || !newNoti.id) return;
                const normalizedNoti = { ...newNoti, read: false };
                setNotifications(prev => {
                    const isExist = prev.some(n => n.id === normalizedNoti.id);
                    return isExist ? prev : [normalizedNoti, ...prev];
                });
                setUnreadCount(prev => prev + 1);
            });
        }
        return () => unsubscribeFromNotifications();
    }, [user?.id]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (noti) => {
        if (noti.read === false || noti.read === undefined) {
            try {
                await markNotificationAsRead(noti.id);
            } catch (error) {
                console.error('Lỗi đánh dấu đã đọc:', error);
            }
            setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, read: true } : n));
            setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
        }
        setIsOpen(false);
        if (noti.link) navigate(noti.link);
    };

    return (
        <div className={cx('noti-container')} ref={dropdownRef}>
            <div className={cx('noti-trigger')} onClick={() => setIsOpen(!isOpen)}>
                <CIcon icon={cilBell} size="lg" className={cx('noti-icon')} />
                {unreadCount > 0 && (
                    <span className={cx('badge-dot')}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>

            {isOpen && (
                <div className={cx('noti-dropdown')}>
                    <div className={cx('noti-header')}>
                        <h4>Thông báo</h4>
                    </div>
                    <div className={cx('noti-list')}>
                        {notifications.length === 0 ? (
                            <div className={cx('noti-empty')}>Bạn chưa có thông báo nào</div>
                        ) : (
                            notifications.map((noti) => (
                                <div
                                    key={noti.id}
                                    className={cx('noti-item', { 'unread': noti.read === false })}
                                    onClick={() => handleNotificationClick(noti)}
                                >
                                    <div className={cx('noti-content')}>
                                        <p>{noti.content}</p>
                                        <span className={cx('noti-time')}>
                                            {formatTimeAgo(noti.createdAt)}
                                        </span>
                                    </div>
                                    {noti.read === false && <div className={cx('unread-dot')} />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── User Dropdown (từ user Header) ───
const UserDropdown = ({ user, onLogout, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cx('user-dropdown-container')} ref={dropdownRef}>
            <div className={cx('user-trigger')} onClick={() => setIsOpen(!isOpen)}>
                <div className={cx('avatar-circle')}>
                    {user.avatar ? <img src={user.avatar} alt="AVT" /> : <FiUser />}
                </div>
                <FiChevronDown className={cx('chevron', { open: isOpen })} />
            </div>
            {isOpen && (
                <div className={cx('dropdown-menu')}>
                    <div className={cx('user-header')}>
                        <div className={cx('avatar-large')}>
                            {user.avatar ? <img src={user.avatar} alt="AVT" /> : <FiUser />}
                        </div>
                        <div className={cx('user-info')}>
                            <p className={cx('user-name')}>{user.fullName || 'Admin'}</p>
                            <p className={cx('user-email')}>{user.email || 'Quản trị viên'}</p>
                        </div>
                    </div>
                    <div className={cx('dropdown-divider')} />
                    <div className={cx('dropdown-item')} onClick={() => onNavigate('/profile')}>
                        <FiUser className={cx('item-icon')} /> <span>Trang cá nhân</span>
                    </div>
                    <div className={cx('dropdown-item')} onClick={() => onNavigate('/my-orders')}>
                        <FiPackage className={cx('item-icon')} /> <span>Đơn hàng</span>
                    </div>
                    <div className={cx('dropdown-item')} onClick={() => onNavigate('/my-favorites')}>
                        <FiHeart className={cx('item-icon')} /> <span>Tin đã lưu</span>
                    </div>
                    <div className={cx('dropdown-divider')} />
                    <div className={cx('dropdown-item', 'logout')} onClick={onLogout}>
                        <FiLogOut className={cx('item-icon')} /> <span>Đăng xuất</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Header chính ───
const Header = ({ onToggleSidebar }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = getToken();
            if (token) {
                try {
                    const res = await getMyInfo();
                    if (res.data?.code === 1000) setUser(res.data.result);
                } catch {
                    removeToken();
                    setUser(null);
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        unsubscribeFromNotifications();
        disconnectSocket();
        removeToken();
        setUser(null);
        navigate('/');
        window.location.reload();
    };

    return (
        <header className={cx('header-wrapper', 'mb-4')}>
            <div className={cx('header-inner')}>
                <div className={cx('header-left')}>
                    <div className={cx('toggler')} onClick={onToggleSidebar}>
                        <CIcon icon={cilMenu} size="lg" />
                    </div>
                </div>

                <div className={cx('header-nav')}>
                    <a href="/admin/dashboard" className={cx('nav-link')}>Bảng điều khiển</a>
                    <a href="/admin/users" className={cx('nav-link')}>Người dùng</a>
                    <a href="/admin/settings" className={cx('nav-link')}>Cài đặt</a>
                </div>

                <div className={cx('header-actions')}>
                    {/* Thông báo */}
                    {user ? (
                        <NotificationDropdown user={user} />
                    ) : (
                        <div className={cx('action-item')} onClick={() => navigate('/login')}>
                            <CIcon icon={cilBell} size="lg" className={cx('action-icon')} />
                        </div>
                    )}

                    {/* Nhắn tin */}
                    <div className={cx('action-item')} onClick={() => navigate('/chat')}>
                        <FiMessageSquare className={cx('action-icon-lg')} />
                    </div>

                    {/* User */}
                    {user ? (
                        <UserDropdown user={user} onLogout={handleLogout} onNavigate={navigate} />
                    ) : (
                        <div className={cx('login-btn')} onClick={() => navigate('/login')}>
                            Đăng nhập
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
