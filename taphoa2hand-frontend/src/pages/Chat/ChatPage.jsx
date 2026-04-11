import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
    FiSearch,
    FiSend,
    FiImage,
    FiPaperclip,
    FiMoreVertical,
    FiMessageCircle,
    FiTag
} from 'react-icons/fi';
import styles from './ChatPage.module.scss';
import { toast } from 'react-toastify';

import {
    getMyConversations,
    getChatMessages,
    createChatMessage
} from '../../services/chatService';

import { createOrder } from '../../services/orderService';

import {
    initiateSocketConnection,
    disconnectSocket,
    joinConversation,
    leaveConversation,
    subscribeToNewMessages,
    unsubscribeFromMessages
} from '../../services/socketService';

const cx = classNames.bind(styles);

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '8px',
    border: '1px solid #ccd0d5',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box'
};

function ChatPage() {
    // ==========================================
    // 1. STATE
    // ==========================================
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [searchParams] = useSearchParams();
    const urlActiveId = searchParams.get('activeId');

    const [activeChatId, setActiveChatId] = useState(urlActiveId || null);

    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Modal order
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [orderForm, setOrderForm] = useState({
        receiverName: '',
        receiverPhone: '',
        shippingAddress: '',
        method: 'MIDDLEMAN',
        bankName: '',
        accountName: '',
        accountNumber: ''
    });

    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');

    const FILTER_TABS = [
        { key: 'all', label: 'Tất cả' },
        { key: 'unread', label: 'Chưa đọc' },
        { key: 'buying', label: 'Mua' },
        { key: 'selling', label: 'Bán' },
        { key: 'hidden', label: 'Đã ẩn' }
    ];

    // ==========================================
    // 2. HELPERS
    // ==========================================
    const safeParseJSON = (value, fallback = {}) => {
        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    };

    const getUserIdFromToken = (jwtToken) => {
        try {
            if (!jwtToken) return null;
            const payload = jwtToken.split('.')[1];
            if (!payload) return null;

            const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
            return decoded?.id || decoded?.userId || decoded?.sub || null;
        } catch {
            return null;
        }
    };

    const currentUser = safeParseJSON(localStorage.getItem('user') || '{}', {});
    const currentUserId =
        currentUser?.id ||
        currentUser?.userId ||
        currentUser?.sub ||
        getUserIdFromToken(token);

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Thỏa thuận';
        const num = Number(price);
        if (isNaN(num)) return price;
        return num.toLocaleString('vi-VN') + ' đ';
    };

    const getSenderId = (msg) => {
        return msg?.sender?.id || msg?.senderId || msg?.userId || msg?.createdBy || null;
    };

    const normalizeMessage = (msg) => {
        const senderId = getSenderId(msg);

        return {
            ...msg,
            me: msg.me ?? String(senderId) === String(currentUserId)
        };
    };

    const getProductImageUrl = (postImage) => {
        if (!postImage) return 'https://via.placeholder.com/50';
        if (Array.isArray(postImage) && postImage.length > 0) {
            return postImage[0]?.url || postImage[0];
        }
        if (typeof postImage === 'string') return postImage;
        return 'https://via.placeholder.com/50';
    };

    const currentChat = chats.find((c) => String(c.id) === String(activeChatId));

    // ==========================================
    // 3. EFFECTS
    // ==========================================
    useEffect(() => {
        if (urlActiveId) {
            setActiveChatId(urlActiveId);
        }
    }, [urlActiveId]);

    useEffect(() => {
        if (token) {
            initiateSocketConnection(token);
        }

        return () => {
            disconnectSocket();
        };
    }, [token]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                setIsLoading(true);
                const response = await getMyConversations();

                if (response && response.result) {
                    const formattedChats = response.result.map((conv) => {
                        const chatName = conv.conversationName || 'Khách hàng';
                        const timeString = conv.updatedAt || conv.createdAt;

                        return {
                            id: conv.id,
                            name: chatName,
                            avatar: conv.conversationAvatar,
                            lastMessage: conv.lastMessage || 'Đã kết nối...',
                            time: formatTime(timeString),
                            unread: conv.unread || 0,
                            type: conv.type?.toLowerCase() || 'selling',
                            postId: conv.postId,
                            postTitle: conv.postTitle,
                            postImage: conv.postImage,
                            postPrice: conv.postPrice,
                            isMyPost: conv.isMyPost
                        };
                    });

                    setChats(formattedChats);
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách đoạn chat:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChats();
    }, []);

    useEffect(() => {
        if (!activeChatId) return;

        const fetchMessages = async () => {
            try {
                const response = await getChatMessages(activeChatId);

                if (response.code === 1000 && response.result) {
                    const sortedMessages = response.result
                        .reverse()
                        .map(normalizeMessage);

                    setMessages(sortedMessages);

                    setChats((prevChats) =>
                        prevChats.map((chat) =>
                            String(chat.id) === String(activeChatId)
                                ? { ...chat, unread: 0 }
                                : chat
                        )
                    );
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách tin nhắn:', error);
            }
        };

        fetchMessages();

        joinConversation(activeChatId);

        subscribeToNewMessages((newMessage) => {
            try {
                const parsedMessage =
                    typeof newMessage === 'string' ? JSON.parse(newMessage) : newMessage;

                const normalizedMessage = normalizeMessage(parsedMessage);

                const isCurrentChat =
                    String(normalizedMessage.conversationId) === String(activeChatId);

                if (isCurrentChat) {
                    setMessages((prev) => {
                        const existingIndex = prev.findIndex(
                            (m) => String(m.id) === String(normalizedMessage.id)
                        );

                        if (existingIndex !== -1) {
                            const next = [...prev];
                            next[existingIndex] = {
                                ...next[existingIndex],
                                ...normalizedMessage
                            };
                            return next;
                        }

                        return [...prev, normalizedMessage];
                    });
                }

                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        String(chat.id) === String(normalizedMessage.conversationId)
                            ? {
                                  ...chat,
                                  lastMessage: normalizedMessage.message || chat.lastMessage,
                                  time: formatTime(
                                      normalizedMessage.createdDate ||
                                          normalizedMessage.createdAt ||
                                          Date.now()
                                  ),
                                  unread: isCurrentChat ? 0 : (chat.unread || 0) + 1
                              }
                            : chat
                    )
                );
            } catch (error) {
                console.error('Lỗi khi parse dữ liệu socket:', error);
            }
        });

        return () => {
            leaveConversation(activeChatId);
            unsubscribeFromMessages();
        };
    }, [activeChatId, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ==========================================
    // 4. HANDLERS
    // ==========================================
    const handleChatSelect = (chatId) => {
        setActiveChatId(chatId);

        setChats((prevChats) =>
            prevChats.map((chat) =>
                String(chat.id) === String(chatId)
                    ? { ...chat, unread: 0 }
                    : chat
            )
        );
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeChatId || isSending) return;

        const trimmedMessage = messageInput.trim();

        const requestBody = {
            conversationId: activeChatId,
            message: trimmedMessage
        };

        setMessageInput('');
        setIsSending(true);

        try {
            const response = await createChatMessage(requestBody);

            if (response.code === 1000 && response.result) {
                const newlySentMessage = normalizeMessage({
                    ...response.result,
                    me: true
                });

                setMessages((prev) => {
                    const existingIndex = prev.findIndex(
                        (m) => String(m.id) === String(newlySentMessage.id)
                    );

                    if (existingIndex !== -1) {
                        const next = [...prev];
                        next[existingIndex] = {
                            ...next[existingIndex],
                            ...newlySentMessage
                        };
                        return next;
                    }

                    return [...prev, newlySentMessage];
                });

                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        String(chat.id) === String(activeChatId)
                            ? {
                                  ...chat,
                                  lastMessage: newlySentMessage.message,
                                  time: formatTime(
                                      newlySentMessage.createdDate ||
                                          newlySentMessage.createdAt
                                  ),
                                  unread: 0
                              }
                            : chat
                    )
                );
            }
        } catch (error) {
            console.error('Lỗi gửi tin nhắn:', error);
            toast.error('Gửi tin nhắn thất bại!');
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setOrderForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRequestTransaction = () => {
        setIsOrderModalOpen(true);
    };

    const submitOrderRequest = async (e) => {
        e.preventDefault();

        if (
            !orderForm.receiverName ||
            !orderForm.receiverPhone ||
            !orderForm.shippingAddress
        ) {
            toast.warning('Vui lòng điền đủ thông tin nhận hàng!');
            return;
        }

        setIsSubmittingOrder(true);

        try {
            const payload = {
                sellerId: String(currentChat?.id || ''),
                postId: String(currentChat?.postId || ''),
                method: orderForm.method,
                receiverName: orderForm.receiverName,
                receiverPhone: orderForm.receiverPhone,
                shippingAddress: orderForm.shippingAddress,
                buyerBank: {
                    bankName: orderForm.bankName,
                    accountName: orderForm.accountName,
                    accountNumber: orderForm.accountNumber
                },
                sellerBank: null
            };

            const res = await createOrder(payload);

            if (res.code === 1000 || res.message === 'Tao order thanh cong') {
                toast.success('Gửi yêu cầu giao dịch thành công!');
                setIsOrderModalOpen(false);

                const autoMessage =
                    'Tôi đã gửi yêu cầu giao dịch cho sản phẩm này qua hệ thống. Vui lòng kiểm tra!';

                try {
                    await createChatMessage({
                        conversationId: activeChatId,
                        message: autoMessage
                    });
                } catch (err) {
                    console.error('Lỗi gửi tin nhắn tự động:', err);
                }
            } else {
                toast.error('Có lỗi xảy ra: ' + (res.message || 'Không xác định'));
            }
        } catch (error) {
            console.error('Lỗi tạo order:', error);
            toast.error('Không thể tạo đơn hàng, thử lại sau!');
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    // ==========================================
    // 5. FILTERED CHATS
    // ==========================================
    const filteredChats = chats.filter((chat) => {
        const lowerSearch = searchQuery.toLowerCase();

        const matchSearch =
            chat.name?.toLowerCase().includes(lowerSearch) ||
            chat.lastMessage?.toLowerCase().includes(lowerSearch);

        if (!matchSearch) return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return chat.unread > 0;

        return chat.type === activeTab;
    });

    // ==========================================
    // 6. RENDER
    // ==========================================
    return (
        <div className={cx('chat-layout')}>
            {/* ---------------- CỘT TRÁI ---------------- */}
            <div className={cx('sidebar')}>
                <div className={cx('search-area')}>
                    <div className={cx('search-box')}>
                        <FiSearch className={cx('icon')} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tin nhắn..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className={cx('filter-tabs')}>
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            className={cx('tab-item', { active: activeTab === tab.key })}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={cx('conversation-list')}>
                    {isLoading ? (
                        <div className={cx('empty-state')}>Đang tải tin nhắn...</div>
                    ) : filteredChats.length > 0 ? (
                        filteredChats.map((chat) => (
                            <div
                                key={chat.id}
                                className={cx('chat-item', {
                                    active: String(activeChatId) === String(chat.id)
                                })}
                                onClick={() => handleChatSelect(chat.id)}
                            >
                                <div className={cx('avatar')}>
                                    {chat.avatar ? (
                                        <img
                                            src={chat.avatar}
                                            alt="avatar"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        chat.name?.charAt(0).toUpperCase()
                                    )}
                                </div>

                                <div className={cx('chat-info')}>
                                    <div className={cx('row-top')}>
                                        <span className={cx('name')}>{chat.name}</span>
                                        <span className={cx('time')}>{chat.time}</span>
                                    </div>

                                    <div className={cx('row-bottom')}>
                                        <span
                                            className={cx('last-message', {
                                                unread: chat.unread > 0
                                            })}
                                        >
                                            {chat.lastMessage}
                                        </span>

                                        {chat.unread > 0 && (
                                            <span className={cx('unread-badge')}>
                                                {chat.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={cx('empty-state')}>Không có tin nhắn nào.</div>
                    )}
                </div>
            </div>

            {/* ---------------- CỘT PHẢI ---------------- */}
            <div
                className={cx('chat-area')}
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
                {activeChatId ? (
                    <>
                        {/* 1. HEADER CHAT */}
                        <div className={cx('chat-header')} style={{ flexShrink: 0 }}>
                            <div className={cx('user-info')}>
                                <div className={cx('avatar')}>
                                    {currentChat?.avatar ? (
                                        <img
                                            src={currentChat.avatar}
                                            alt="avatar"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        currentChat?.name?.charAt(0).toUpperCase()
                                    )}
                                </div>

                                <div>
                                    <div className={cx('name')}>{currentChat?.name}</div>
                                    <div className={cx('status')}>Đang hoạt động</div>
                                </div>
                            </div>

                            <div className={cx('actions')}>
                                <button>
                                    <FiMoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* 2. GHIM SẢN PHẨM */}
                        {currentChat?.postId && (
                            <div
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f0f2f5',
                                    borderBottom: '1px solid #e4e6eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    flexShrink: 0
                                }}
                            >
                                <div
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        flexShrink: 0
                                    }}
                                >
                                    <img
                                        src={getProductImageUrl(currentChat.postImage)}
                                        alt="Product"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: 1
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: '600',
                                            fontSize: '15px',
                                            color: '#050505',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <FiTag size={16} color="#0084ff" />
                                        <span
                                            style={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '300px'
                                            }}
                                        >
                                            {currentChat.postTitle || 'Sản phẩm đang trao đổi'}
                                        </span>
                                    </span>

                                    <span
                                        style={{
                                            fontWeight: '600',
                                            fontSize: '15px',
                                            color: '#e53935'
                                        }}
                                    >
                                        {formatPrice(currentChat.postPrice)}
                                    </span>

                                    <span style={{ fontSize: '13px', color: '#65676B' }}>
                                        ID: {currentChat.postId}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '8px',
                                        flexDirection: 'column'
                                    }}
                                >
                                    {!currentChat.isMyPost && (
                                        <button
                                            onClick={handleRequestTransaction}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#0084ff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                color: '#ffffff',
                                                fontSize: '13px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) =>
                                                (e.target.style.backgroundColor = '#0073e6')
                                            }
                                            onMouseOut={(e) =>
                                                (e.target.style.backgroundColor = '#0084ff')
                                            }
                                        >
                                            Yêu cầu giao dịch
                                        </button>
                                    )}

                                    <button
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#e4e6eb',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            color: '#050505',
                                            fontSize: '13px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseOver={(e) =>
                                            (e.target.style.backgroundColor = '#d8dadf')
                                        }
                                        onMouseOut={(e) =>
                                            (e.target.style.backgroundColor = '#e4e6eb')
                                        }
                                    >
                                        Xem bài
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3. TIN NHẮN */}
                        <div
                            className={cx('messages-container')}
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '20px'
                            }}
                        >
                            {messages.length === 0 ? (
                                <div
                                    className={cx('welcome-text')}
                                    style={{
                                        textAlign: 'center',
                                        marginTop: '20px',
                                        color: '#65676B'
                                    }}
                                >
                                    Bắt đầu trò chuyện với {currentChat?.name}
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMyMessage =
                                        msg.me ??
                                        String(getSenderId(msg)) === String(currentUserId);

                                    return (
                                        <div
                                            key={msg.id}
                                            style={{
                                                display: 'flex',
                                                alignSelf: isMyMessage
                                                    ? 'flex-end'
                                                    : 'flex-start',
                                                flexDirection: isMyMessage
                                                    ? 'row-reverse'
                                                    : 'row',
                                                alignItems: 'flex-end',
                                                gap: '8px',
                                                margin: '8px 0',
                                                maxWidth: '80%'
                                            }}
                                        >
                                            {!isMyMessage && (
                                                <div
                                                    style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#e4e6eb',
                                                        flexShrink: 0,
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {msg.sender?.avatar ? (
                                                        <img
                                                            src={msg.sender.avatar}
                                                            alt="avatar"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                color: '#65676B'
                                                            }}
                                                        >
                                                            {(
                                                                msg.sender?.fullName ||
                                                                msg.sender?.username ||
                                                                '?'
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: isMyMessage
                                                        ? 'flex-end'
                                                        : 'flex-start'
                                                }}
                                            >
                                                {!isMyMessage && (
                                                    <span
                                                        style={{
                                                            fontSize: '12px',
                                                            color: '#65676B',
                                                            marginBottom: '4px',
                                                            marginLeft: '4px'
                                                        }}
                                                    >
                                                        {msg.sender?.fullName ||
                                                            msg.sender?.username ||
                                                            'Khách hàng'}
                                                    </span>
                                                )}

                                                <div
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderRadius: '18px',
                                                        backgroundColor: isMyMessage
                                                            ? '#0084ff'
                                                            : '#e4e6eb',
                                                        color: isMyMessage
                                                            ? '#fff'
                                                            : '#050505',
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap'
                                                    }}
                                                >
                                                    {msg.message}
                                                </div>

                                                <span
                                                    style={{
                                                        fontSize: '11px',
                                                        color: '#8a8d91',
                                                        marginTop: '4px',
                                                        marginRight: isMyMessage
                                                            ? '4px'
                                                            : '0',
                                                        marginLeft: !isMyMessage
                                                            ? '4px'
                                                            : '0'
                                                    }}
                                                >
                                                    {formatTime(
                                                        msg.createdDate || msg.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* 4. INPUT */}
                        <div className={cx('chat-input')} style={{ flexShrink: 0 }}>
                            <button className={cx('action-btn')}>
                                <FiPaperclip size={20} />
                            </button>

                            <button className={cx('action-btn')}>
                                <FiImage size={20} />
                            </button>

                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isSending}
                            />

                            <button
                                className={cx('send-btn', {
                                    active: messageInput.trim().length > 0
                                })}
                                onClick={handleSendMessage}
                                disabled={isSending || !messageInput.trim()}
                            >
                                <FiSend size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div
                        className={cx('no-chat-selected')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#65676B'
                        }}
                    >
                        <div
                            className={cx('icon-wrapper')}
                            style={{ marginBottom: '16px' }}
                        >
                            <FiMessageCircle size={48} color="#0084ff" />
                        </div>

                        <h3 style={{ margin: '0 0 8px 0', color: '#050505' }}>
                            Chào mừng đến với TapHoa2Hand Chat
                        </h3>

                        <p style={{ margin: 0 }}>
                            Chọn một cuộc trò chuyện để bắt đầu nhắn tin hoặc tìm kiếm
                            ở thanh bên trái.
                        </p>
                    </div>
                )}
            </div>

            {/* ========================================= */}
            {/* POPUP: YÊU CẦU GIAO DỊCH */}
            {/* ========================================= */}
            {isOrderModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '24px',
                            borderRadius: '12px',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                    >
                        <h2
                            style={{
                                marginTop: 0,
                                borderBottom: '1px solid #eee',
                                paddingBottom: '12px',
                                color: '#050505'
                            }}
                        >
                            Yêu Cầu Giao Dịch
                        </h2>

                        <div
                            style={{
                                marginBottom: '16px',
                                padding: '12px',
                                backgroundColor: '#f0f8ff',
                                borderRadius: '8px'
                            }}
                        >
                            <strong>Sản phẩm:</strong> {currentChat?.postTitle} <br />
                            <strong>Giá:</strong>{' '}
                            <span
                                style={{
                                    color: '#e53935',
                                    fontWeight: 'bold'
                                }}
                            >
                                {formatPrice(currentChat?.postPrice)}
                            </span>
                        </div>

                        <form
                            onSubmit={submitOrderRequest}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}
                        >
                            <div>
                                <strong>1. Thông tin nhận hàng</strong>
                                <input
                                    required
                                    type="text"
                                    name="receiverName"
                                    value={orderForm.receiverName}
                                    onChange={handleFormChange}
                                    placeholder="Tên người nhận"
                                    style={inputStyle}
                                />
                                <input
                                    required
                                    type="text"
                                    name="receiverPhone"
                                    value={orderForm.receiverPhone}
                                    onChange={handleFormChange}
                                    placeholder="Số điện thoại"
                                    style={inputStyle}
                                />
                                <textarea
                                    required
                                    name="shippingAddress"
                                    value={orderForm.shippingAddress}
                                    onChange={handleFormChange}
                                    placeholder="Địa chỉ giao hàng (Số nhà, đường, phường, quận...)"
                                    style={{
                                        ...inputStyle,
                                        height: '80px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div>
                                <strong>2. Phương thức giao dịch</strong>
                                <select
                                    name="method"
                                    value={orderForm.method}
                                    onChange={handleFormChange}
                                    style={inputStyle}
                                >
                                    <option value="MIDDLEMAN">
                                        Giao dịch qua Trung gian (An toàn)
                                    </option>
                                    <option value="DIRECT">
                                        Giao dịch Trực tiếp (Tự thỏa thuận)
                                    </option>
                                </select>
                            </div>

                            {orderForm.method === 'MIDDLEMAN' && (
                                <div>
                                    <strong>
                                        3. Thông tin ngân hàng của bạn (Để hoàn tiền nếu
                                        huỷ)
                                    </strong>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={orderForm.bankName}
                                        onChange={handleFormChange}
                                        placeholder="Tên Ngân Hàng (VD: Vietcombank)"
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        name="accountName"
                                        value={orderForm.accountName}
                                        onChange={handleFormChange}
                                        placeholder="Tên chủ tài khoản"
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={orderForm.accountNumber}
                                        onChange={handleFormChange}
                                        placeholder="Số tài khoản"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px',
                                    marginTop: '10px'
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setIsOrderModalOpen(false)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: '#e4e6eb',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmittingOrder}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: isSubmittingOrder
                                            ? '#888'
                                            : '#0084ff',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {isSubmittingOrder
                                        ? 'Đang gửi...'
                                        : 'Xác nhận gửi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatPage;