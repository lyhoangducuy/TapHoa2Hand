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
import {
    disconnectSocket,
    subscribeToNotifications,
    subscribeToNewMessages,
    getListenerCounts,
} from "../../../../services/socketService";

const cx = classNames.bind(styles);

// ============================================================
// PURE HELPERS (stable, outside component)
// ============================================================
const playNotificationSound = () => {
    try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });
    } catch (e) { }
};

// ============================================================
// COMPONENT 1: USER DROPDOWN
// ============================================================
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

// ============================================================
// COMPONENT 2: SEARCH HISTORY DROPDOWN
// ============================================================
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
                console.error('[Header] SearchHistory error:', err);
                setHistory([]);
            }
        };

        fetchHistory();
    }, [visible, userId]);

    if (!visible) return null;

    return (
        <div className={cx("search-history-dropdown")}>
            {history.length === 0 ? (
                <div className={cx("search-history-empty")}>Chưa có lịch sử tìm kiếm</div>
            ) : (
                history.map((item, index) => (
                    <div key={index} className={cx("search-history-item")} onClick={() => onSelect(item)}>
                        <FiSearch className={cx("icon")} />
                        <span>{item}</span>
                    </div>
                ))
            )}
        </div>
    );
};

// ============================================================
// COMPONENT 3: NOTIFICATION DROPDOWN (REALTIME)
// ============================================================
const NotificationDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Store unsubscribe function and callback across re-renders
    const unsubscribeRef = useRef(null);
    const notiCallbackRef = useRef(null);

    // ── Phase 1: Define stable callback (no deps — only depends on React closures) ──
    // This function is kept stable across renders via the ref
    useEffect(() => {
        notiCallbackRef.current = (payload) => {
            let parsed = payload;
            if (payload && payload.body) {
                try { parsed = JSON.parse(payload.body); }
                catch (e) { console.error('[Header] Parse error:', e); return; }
            } else if (typeof payload === 'string') {
                try { parsed = JSON.parse(payload); }
                catch (e) { console.error('[Header] Parse string error:', e); return; }
            }

            const newNoti = parsed.result ? parsed.result : parsed;

            if (!newNoti || !newNoti.id) {
                console.error('[Header] Invalid notification payload:', newNoti);
                return;
            }

            console.log('[Header] 🔔 Notification received:', newNoti.id);

            // Guard: duplicate ID check is done atomically inside setState
            setNotifications(prev => {
                if (prev.some(n => n.id === newNoti.id)) {
                    console.log('[Header] ⏭️ Duplicate ID, skipping:', newNoti.id);
                    return prev;
                }
                // Only increment when truly new
                setUnreadCount(c => c + 1);
                return [newNoti, ...prev];
            });
        };
    }); // No deps — re-assigns .current on every render safely

    // ── Phase 2: Subscribe once, store cleanup function ──
    useEffect(() => {
        if (!user?.id) return;

        // Fetch initial data from API
        const fetchNotificationsData = async (userId) => {
            try {
                const [notiRes, countRes] = await Promise.all([
                    getUserNotifications(userId),
                    getUnreadNotificationCount(userId)
                ]);

                let notiData = notiRes?.data?.result || notiRes?.result || [];
                if (!Array.isArray(notiData) && notiData?.id) {
                    notiData = [notiData];
                } else if (!Array.isArray(notiData)) {
                    notiData = [];
                }

                setNotifications(notiData);

                const countData = countRes?.data?.result ?? countRes?.result ?? 0;
                setUnreadCount(Number(countData));
            } catch (error) {
                console.error('[Header] NotificationDropdown fetch error:', error);
            }
        };

        fetchNotificationsData(user.id);

        // Subscribe — pass the stable callback from ref
        const unsub = subscribeToNotifications((data) => {
            if (notiCallbackRef.current) notiCallbackRef.current(data);
        });
        unsubscribeRef.current = unsub;
        console.log('[Header] 🔔 Subscribed. Listeners:', getListenerCounts().notifications);

        // Cleanup: always calls the stored unsubscribe
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
                console.log('[Header] 🔔 Unsubscribed. Listeners:', getListenerCounts().notifications);
            }
        };
    }, [user?.id]); // Only re-runs when user.id truly changes

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (noti) => {
        if (!noti.read) {
            try {
                await markNotificationAsRead(noti.id);
                // Re-sync count from API
                const countRes = await getUnreadNotificationCount(user.id);
                const countData = countRes?.data?.result ?? countRes?.result ?? 0;
                setUnreadCount(Number(countData));
                // Update local read state
                setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, read: true } : n));
            } catch (error) {
                console.error('[Header] Mark as read error:', error);
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

// ============================================================
// COMPONENT 4: CHAT NOTIFICATION POPUP
// ============================================================
const ChatNotificationPopup = ({ chatPopup, onClose, onNavigate }) => {
    if (!chatPopup) return null;

    return (
        <div className={cx("chat-popup-dropdown")} onClick={() => { onNavigate(`/chat?activeId=${chatPopup.conversationId}`); onClose(); }}>
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

// ============================================================
// COMPONENT 5: HEADER CHÍNH
// ============================================================
function Header() {
    const [isMobile, setIsMobile] = useState(false);
    const [user, setUser] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const navigate = useNavigate();
    const [showHistory, setShowHistory] = useState(false);

    // Chat notification state
    const [chatPopup, setChatPopup] = useState(null);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const chatPopupTimerRef = useRef(null);
    const chatUnsubscribeRef = useRef(null);

    // ─────────────────────────────────────────────────────────
    // Chat: stable handler ref + proper subscribe/unsubscribe
    // ─────────────────────────────────────────────────────────
    const handleChatMessageRef = useRef(null);

    useEffect(() => {
        handleChatMessageRef.current = (messageData) => {
            try {
                const parsedMessage = typeof messageData === 'string'
                    ? JSON.parse(messageData)
                    : messageData;

                console.log('[Header] 📩 Chat message received:', parsedMessage.id || parsedMessage);

                if (!parsedMessage) return;

                // Skip my own messages
                if (String(parsedMessage.sender?.userId) === String(user?.id)) {
                    console.log('[Header] ⏭️ Skipping own message');
                    return;
                }

                // Skip if viewing this conversation
                const params = new URLSearchParams(window.location.search);
                const currentChatId = params.get('activeId');
                if (currentChatId && String(parsedMessage.conversationId) === String(currentChatId)) {
                    console.log('[Header] ⏭️ Skipping — viewing this conversation');
                    return;
                }

                playNotificationSound();

                setChatPopup({
                    conversationId: parsedMessage.conversationId,
                    senderName: parsedMessage.sender?.fullName || parsedMessage.sender?.username || 'Người dùng',
                    message: parsedMessage.message || '',
                });

                setUnreadChatCount(prev => {
                    console.log('[Header] 📈 Chat unread count:', prev, '→', prev + 1);
                    return prev + 1;
                });

                if (chatPopupTimerRef.current) clearTimeout(chatPopupTimerRef.current);
                chatPopupTimerRef.current = setTimeout(() => setChatPopup(null), 3000);
            } catch (e) {
                console.error('[Header] Error handling chat message:', e);
            }
        };
    }, [user]);

    // Subscribe once, store unsubscribe in ref
    useEffect(() => {
        const unsub = subscribeToNewMessages((data) => {
            if (handleChatMessageRef.current) handleChatMessageRef.current(data);
        });

        chatUnsubscribeRef.current = unsub;
        console.log('[Header] 📩 Chat subscribed. Listeners:', getListenerCounts().messages);

        return () => {
            if (chatUnsubscribeRef.current) {
                chatUnsubscribeRef.current();
                chatUnsubscribeRef.current = null;
                console.log('[Header] 📩 Chat unsubscribed. Listeners:', getListenerCounts().messages);
            }
        };
    }, []); // Empty deps — subscribe exactly ONCE

    // Reset chat unread when entering chat page
    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/chat')) {
            setUnreadChatCount(0);
        }
    }, [window.location.search]);

    // Responsive
    useEffect(() => {
        const checkDevice = () => setIsMobile(window.innerWidth < 768);
        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    // Fetch user
    useEffect(() => {
        const token = getToken();
        if (token) {
            getMyInfo()
                .then(res => {
                    if (res?.data?.code === 1000) setUser(res.data.result);
                })
                .catch(() => { removeToken(); setUser(null); });
        }
    }, []);

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
        if (chatPopupTimerRef.current) clearTimeout(chatPopupTimerRef.current);
        setChatPopup(null);
    };

    return (
        <header className={cx("wrapper", { "wrapper-mobile": isMobile })}>
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

                    <div
                        className={cx("action-item", "chat-action")}
                        onClick={() => { navigate('/chat'); setUnreadChatCount(0); }}
                    >
                        <div className={cx("icon-wrapper")}>
                            <FiMessageSquare className={cx("icon")} />
                            {unreadChatCount > 0 && (
                                <span className={cx("chat-badge")}>
                                    {unreadChatCount > 99 ? '99+' : unreadChatCount}
                                </span>
                            )}
                        </div>
                        <span>Nhắn tin</span>
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
