import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Header.module.scss";
import {
    FiSearch, FiBell, FiMessageSquare, FiUser, FiPlusCircle,
    FiLogIn, FiChevronDown, FiSettings, FiPackage, FiLogOut, FiHeart, FiFlag, FiX
} from 'react-icons/fi';

import Sidebar from "../Sidebar/Sidebar";
import { getMyInfo } from "../../../../services/userService";
import { getToken, removeToken } from "../../../../services/localstorageService";
import {
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead
} from "../../../../services/notificationService";
import { getSearchHistory } from "../../../../services/historySearchService";
// Import các hàm socket từ service của bạn
import {
    disconnectSocket,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    subscribeToNewMessages,
    unsubscribeFromMessages
} from "../../../../services/socketService";

const cx = classNames.bind(styles);

// Play notification sound
const playNotificationSound = () => {
    try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });
    } catch (e) { }
};

// --- 1. COMPONENT USER DROPDOWN ---
const UserDropdown = ({ user, onLogout, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cx("user-dropdown-container")} ref={dropdownRef}>
            <div className={cx("user-trigger")} onClick={() => setIsOpen(!isOpen)}>
                <div className={cx("avatar-circle")}>
                    {user.avatar ? <img src={user.avatar} alt="AVT" /> : <FiUser />}
                </div>
                <FiChevronDown className={cx("chevron", { open: isOpen })} />
            </div>
            {isOpen && (
                <div className={cx("dropdown-menu")}>
                    <div className={cx("user-header")}>
                        <div className={cx("avatar-large")}>
                            {user.avatar ? <img src={user.avatar} alt="AVT" /> : <FiUser />}
                        </div>
                        <div className={cx("user-info")}>
                            <p className={cx("user-name")}>{user.fullName || "Người dùng"}</p>
                            <p className={cx("user-email")}>{user.email || "Thành viên"}</p>
                        </div>
                    </div>
                    <div className={cx("dropdown-divider")}></div>
                    <div className={cx("dropdown-item")} onClick={() => onNavigate('/profile')}>
                        <FiUser className={cx("item-icon")} /> <span>Trang cá nhân</span>
                    </div>
                    <div className={cx("dropdown-item")} onClick={() => onNavigate('/my-orders')}>
                        <FiPackage className={cx("item-icon")} /> <span>Đơn hàng</span>
                    </div>
                    <div className={cx("dropdown-item")} onClick={() => onNavigate('/my-reports')}>
                        <FiFlag className={cx("item-icon")} /> <span>Báo cáo của tôi</span>
                    </div>
                    <div className={cx("dropdown-item")} onClick={() => onNavigate('/my-favorites')}>
                        <FiHeart className={cx("item-icon")} /> <span>Tin đã lưu</span>
                    </div>
                    <div className={cx("dropdown-divider")}></div>
                    <div className={cx("dropdown-item", "logout")} onClick={onLogout}>
                        <FiLogOut className={cx("item-icon")} /> <span>Đăng xuất</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 2. COMPONENT NOTIFICATION DROPDOWN (REALTIME) ---
const SearchHistoryDropdown = ({ userId, onSelect, visible }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!visible || !userId) return;

        const fetchHistory = async () => {
            try {
                const res = await getSearchHistory(userId);
                const data = res?.result || [];
                setHistory(Array.isArray(data) ? data.slice(0, 10) : []);
            } catch (err) {
                console.error(err);
                setHistory([]);
            }
        };

        fetchHistory();
    }, [visible, userId]);

    if (!visible) return null;

    return (
        <div className={cx("search-history-dropdown")}>
            {history.length === 0 ? (
                <div className={cx("search-history-empty")}>
                    Chưa có lịch sử tìm kiếm
                </div>
            ) : (
                history.map((item, index) => (
                    <div
                        key={index}
                        className={cx("search-history-item")}
                        onClick={() => onSelect(item)}
                    >
                        <FiSearch className={cx("icon")} />
                        <span>{item}</span>
                    </div>
                ))
            )}
        </div>
    );
};
// --- 2. COMPONENT NOTIFICATION DROPDOWN (REALTIME) ---
const NotificationDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Lấy dữ liệu ban đầu từ API
    const fetchNotificationsData = async () => {
        try {
            console.log("1. Đang gọi API lấy thông báo ban đầu cho User ID:", user.id);
            const [notiRes, countRes] = await Promise.all([
                getUserNotifications(user.id),
                getUnreadNotificationCount(user.id)
            ]);

            console.log("2. Kết quả API Danh sách thông báo:", notiRes);
            console.log("3. Kết quả API Số lượng chưa đọc:", countRes);

            // Bóc tách dữ liệu API
            let notiData = notiRes.data?.result || notiRes.result || [];

            // ĐỀ PHÒNG: Nếu backend trả về 1 Object thay vì Array, ta phải nhét nó vào Array
            if (!Array.isArray(notiData) && notiData.id) {
                notiData = [notiData];
            } else if (!Array.isArray(notiData)) {
                notiData = []; // Khắc phục lỗi map() nếu dữ liệu rác
            }

            setNotifications(notiData);

            let countData = countRes.data?.result ?? countRes.result ?? 0;
            setUnreadCount(Number(countData));

        } catch (error) {
            console.error("❌ Lỗi lấy thông báo API ban đầu:", error);
        }
    };

    useEffect(() => {
        if (user && user.id) {
            fetchNotificationsData();

            subscribeToNotifications((payload) => {
                console.log("🔥 4. CÓ TÍN HIỆU REALTIME TỪ SOCKET! Payload gốc:", payload);

                let parsedData = payload;

                // XỬ LÝ TRƯỜNG HỢP: Nếu dùng STOMP/SockJS, data thường nằm trong payload.body
                if (payload && payload.body) {
                    try { parsedData = JSON.parse(payload.body); }
                    catch (e) { console.error("Lỗi parse STOMP body", e); }
                }
                // XỬ LÝ TRƯỜNG HỢP: Socket trả về chuỗi String (chưa thành JSON)
                else if (typeof payload === 'string') {
                    try { parsedData = JSON.parse(payload); }
                    catch (e) { console.error("Lỗi parse JSON string", e); }
                }

                // Lấy data cuối cùng
                const newNoti = parsedData.result ? parsedData.result : parsedData;
                console.log("✅ 5. DỮ LIỆU SAU KHI BÓC TÁCH ĐỂ LƯU VÀO STATE:", newNoti);

                // Nếu mất ID thì ngưng, tránh làm sập React
                if (!newNoti || !newNoti.id) {
                    console.error("❌ Dữ liệu realtime thiếu ID, không thể cập nhật UI!", newNoti);
                    return;
                }

                setNotifications(prev => {
                    const isExist = prev.some(n => n.id === newNoti.id);
                    return isExist ? prev : [newNoti, ...prev];
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
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (noti) => {
        // Đánh dấu đã đọc (chỉ khi chưa đọc)
        if (!noti.read) {
            try {
                await markNotificationAsRead(noti.id);
                // Re-fetch count từ API để đảm bảo đồng bộ
                const countRes = await getUnreadNotificationCount(user.id);
                let countData = countRes.data?.result ?? countRes.result ?? 0;
                setUnreadCount(Number(countData));
                // Cập nhật local state
                setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, read: true } : n));
            } catch (error) {
                console.error("Lỗi đánh dấu đã đọc:", error);
            }
        }
        setIsOpen(false);
        if (noti.link) navigate(noti.link);
    };

    return (
        <div className={cx("action-item", "noti-container")} ref={dropdownRef}>
            <div className={cx("noti-trigger")} onClick={() => setIsOpen(!isOpen)}>
                <FiBell className={cx("icon")} />
                <span className={cx("action-text")}>Thông báo</span>
                {unreadCount > 0 && (
                    <span className={cx("badge")}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>

            {isOpen && (
                <div className={cx("noti-dropdown")}>
                    <div className={cx("noti-header")}>
                        <h4>Thông báo</h4>
                    </div>
                    <div className={cx("noti-list")}>
                        {notifications.length === 0 ? (
                            <div className={cx("noti-empty")}>Bạn chưa có thông báo nào</div>
                        ) : (
                            notifications.map((noti) => (
                                <div
                                    key={noti.id}
                                    className={cx("noti-item", { "unread": !noti.read })}
                                    onClick={() => handleNotificationClick(noti)}
                                >
                                    <div className={cx("noti-content")}>
                                        <p>{noti.content}</p>
                                        <span className={cx("noti-time")}>
                                            {noti.createdAt ? new Date(noti.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                                        </span>
                                    </div>
                                    {!noti.read && <div className={cx("unread-dot")}></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- CHAT NOTIFICATION POPUP ---
const ChatNotificationPopup = ({ chatPopup, onClose, onNavigate }) => {
    if (!chatPopup) return null;

    const handleClick = () => {
        onNavigate(`/chat?activeId=${chatPopup.conversationId}`);
        onClose();
    };

    return (
        <div className={cx("chat-popup-dropdown")} onClick={handleClick}>
            <div className={cx("chat-popup-content")}>
                <div className={cx("chat-popup-header")}>
                    <FiMessageSquare />
                    <span>Tin nhắn mới</span>
                    <button className={cx("chat-popup-close")} onClick={(e) => { e.stopPropagation(); onClose(); }}>
                        <FiX />
                    </button>
                </div>
                <div className={cx("chat-popup-body")}>
                    <div className={cx("chat-popup-sender")}>
                        <strong>{chatPopup.senderName}</strong>
                    </div>
                    <div className={cx("chat-popup-message")}>
                        {chatPopup.message || 'Đã gửi một tin nhắn'}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3. COMPONENT HEADER CHÍNH ---
function Header() {
    const [isMobile, setIsMobile] = useState(false);
    const [user, setUser] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const navigate = useNavigate();
    const [showHistory, setShowHistory] = useState(false);

    // Chat notification popup state
    const [chatPopup, setChatPopup] = useState(null);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const chatPopupTimerRef = useRef(null);

    // Get current chat conversation ID from URL to avoid showing popup for current chat
    const getCurrentChatId = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('activeId');
    };

    // Handle new chat message notification - stable callback ref
    const handleNewChatMessageRef = useRef(null);

    // Create the handler once
    useEffect(() => {
        handleNewChatMessageRef.current = (messageData) => {
            try {
                // Parse if string
                const parsedMessage = typeof messageData === 'string'
                    ? JSON.parse(messageData)
                    : messageData;
                console.log("SOCKET MESSAGE:", parsedMessage);
                console.log("CURRENT USER:", user);
                if (!parsedMessage) return;

                // bỏ qua tin nhắn của chính mình
                // bỏ qua tin nhắn của chính mình
if (String(parsedMessage.sender?.userId) === String(user?.id)) {
    return;
}

                // Skip if this is my own message
                // Skip if message is from myself
                // Skip if message is from myself
                if (String(parsedMessage.senderId) === String(user?.id)) {
                    return;
                }
                // Skip if currently viewing this conversation
                const currentChatId = getCurrentChatId();
                if (currentChatId && String(parsedMessage.conversationId) === String(currentChatId)) return;

                // Play sound
                playNotificationSound();

                // Show popup with new message data
                setChatPopup({
                    conversationId: parsedMessage.conversationId,
                    senderName: parsedMessage.sender?.fullName || parsedMessage.sender?.username || 'Người dùng',
                    message: parsedMessage.message || ''
                });

                // Increment unread count
                setUnreadChatCount(prev => prev + 1);

                // Clear existing timer
                if (chatPopupTimerRef.current) {
                    clearTimeout(chatPopupTimerRef.current);
                }

                // Auto hide after 3 seconds
                chatPopupTimerRef.current = setTimeout(() => {
                    setChatPopup(null);
                }, 3000);
            } catch (e) {
                console.error('Error handling chat message:', e);
            }
        };
    }, [user]);

    // Subscribe to new chat messages (global listener)
    useEffect(() => {
        if (!user) return; // Only subscribe when logged in

        const unsubscribe = subscribeToNewMessages((data) => {
            if (handleNewChatMessageRef.current) {
                handleNewChatMessageRef.current(data);
            }
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
            if (chatPopupTimerRef.current) {
                clearTimeout(chatPopupTimerRef.current);
            }
        };
    }, [user]);

    // Subscribe to notifications
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToNotifications(() => { });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [user]);

    useEffect(() => {
        const checkDevice = () => setIsMobile(window.innerWidth < 768);
        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const token = getToken();
            if (token) {
                try {
                    const res = await getMyInfo();
                    if (res.data.code === 1000) setUser(res.data.result);
                } catch {
                    removeToken();
                    setUser(null);
                }
            }
        };
        fetchUser();
    }, []);

    // Reset unread count when viewing chat
    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/chat')) {
            setUnreadChatCount(0);
        }
    }, [window.location.search]);

    const handleLogout = () => {
        disconnectSocket();
        removeToken();
        setUser(null);
        navigate('/');
        window.location.reload();
    };

    const handleSearch = () => {
        if (searchKeyword.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleChatPopupClose = () => {
        if (chatPopupTimerRef.current) {
            clearTimeout(chatPopupTimerRef.current);
        }
        setChatPopup(null);
    };

    return (
        <header className={cx("wrapper", { "wrapper-mobile": isMobile })}>
            {/* Chat Notification Popup */}
            <ChatNotificationPopup
                chatPopup={chatPopup}
                onClose={handleChatPopupClose}
                onNavigate={navigate}
            />

            <div className={cx(isMobile ? "inner-mobile" : "inner-desktop")}>
                <div className={cx("header-left")}>
                    <Sidebar />
                    <div className={cx("logo")} onClick={() => navigate('/')}>
                        <span className={cx("logo-text")}>TapHoa<span className={cx("highlight")}>2Hand</span></span>
                    </div>
                </div>

                <div className={cx("search-wrapper", { "mobile-search": isMobile })}>
                    <div className={cx("search-box")}>
                        <input
                            type="text"
                            placeholder={isMobile ? "Tìm đồ cũ..." : "Tìm kiếm đồ cũ giá hời tại Huế..."}
                            className={cx("search-input")}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowHistory(true)}
                            onBlur={() => setTimeout(() => setShowHistory(false), 150)}
                        />

                        <button className={cx("search-btn")} onClick={handleSearch}>
                            <FiSearch />
                        </button>

                        {/* DROPDOWN HISTORY */}
                        {user && (
                            <SearchHistoryDropdown
                                userId={user?.id}
                                visible={showHistory}
                                onSelect={(keyword) => {
                                    setSearchKeyword(keyword);
                                    setShowHistory(false);
                                    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
                                }}
                            />
                        )}
                    </div>
                </div>

                <div className={cx("actions")}>
                    {user ? (
                        <NotificationDropdown user={user} />
                    ) : (
                        <div className={cx("action-item")} onClick={() => navigate('/login')}>
                            <FiBell className={cx("icon")} /><span>Thông báo</span>
                        </div>
                    )}

                    <div className={cx("action-item", "chat-action")} onClick={() => { navigate('/chat'); setUnreadChatCount(0); }}>
                        <FiMessageSquare className={cx("icon")} />
                        <span>Nhắn tin</span>
                        {unreadChatCount > 0 && (
                            <span className={cx("badge", "chat-badge")}>
                                {unreadChatCount > 99 ? '99+' : unreadChatCount}
                            </span>
                        )}
                    </div>

                    <div className={cx("btn-group")}>
                        {!user && (
                            <button className={cx("login-btn")} onClick={() => navigate('/login')}>
                                <FiLogIn /> <span>Đăng nhập</span>
                            </button>
                        )}
                        <button className={cx("post-btn")} onClick={() => navigate('/create-post')}>
                            <FiPlusCircle /> <span>ĐĂNG TIN</span>
                        </button>
                        {user && <UserDropdown user={user} onLogout={handleLogout} onNavigate={navigate} />}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;