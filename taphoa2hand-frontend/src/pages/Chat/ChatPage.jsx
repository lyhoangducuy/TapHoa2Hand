import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
    FiSearch, FiSend, FiImage, FiPaperclip, 
    FiMoreVertical, FiMessageCircle, FiTag
} from 'react-icons/fi';
import styles from './ChatPage.module.scss';
import { toast } from 'react-toastify';

import { getMyConversations, getChatMessages, createChatMessage } from '../../services/chatService';
import { createOrder } from '../../services/orderService';
import {
    initiateSocketConnection, disconnectSocket, joinConversation,
    leaveConversation, subscribeToNewMessages, unsubscribeFromMessages
} from '../../services/socketService';

const cx = classNames.bind(styles);

// ==========================================
// PURE HELPERS (Đưa ra ngoài để tránh re-render)
// ==========================================
const safeParseJSON = (value, fallback = {}) => {
    try { return JSON.parse(value); } catch { return fallback; }
};

const getUserIdFromToken = (jwtToken) => {
    try {
        if (!jwtToken) return null;
        const payload = jwtToken.split('.')[1];
        if (!payload) return null;
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded?.id || decoded?.userId || decoded?.sub || null;
    } catch { return null; }
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit'
    });
};

const formatPrice = (price) => {
    if (!price && price !== 0) return 'Thỏa thuận';
    const num = Number(price);
    if (isNaN(num)) return price;
    return num.toLocaleString('vi-VN') + ' đ';
};

const getSenderId = (msg) => msg?.sender?.id || msg?.senderId || msg?.userId || msg?.createdBy || null;

const getProductImageUrl = (postImage) => {
    if (!postImage) return 'https://via.placeholder.com/50';
    if (Array.isArray(postImage) && postImage.length > 0) return postImage[0]?.url || postImage[0];
    if (typeof postImage === 'string') return postImage;
    return 'https://via.placeholder.com/50';
};

const FILTER_TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc' },
    { key: 'buying', label: 'Mua' },
    { key: 'selling', label: 'Bán' },
    { key: 'hidden', label: 'Đã ẩn' }
];

// ==========================================
// MAIN COMPONENT
// ==========================================
function ChatPage() {
    // --- 1. STATES ---
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

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [orderForm, setOrderForm] = useState({
        sellerId: '', buyerId: '', postId: '', method: 'MIDDLEMAN',
        receiverName: '', receiverPhone: '', shippingAddress: ''
    });

    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');
    
    const currentUser = safeParseJSON(localStorage.getItem('user') || '{}', {});
    const currentUserId = currentUser?.id || currentUser?.userId || currentUser?.sub || getUserIdFromToken(token);

    const currentChat = chats.find((c) => String(c.id) === String(activeChatId));

    const normalizeMessage = (msg) => ({
        ...msg,
        me: msg.me ?? String(getSenderId(msg)) === String(currentUserId)
    });

    // --- 2. EFFECTS ---
    useEffect(() => {
        if (urlActiveId) setActiveChatId(urlActiveId);
    }, [urlActiveId]);

    useEffect(() => {
        if (token) initiateSocketConnection(token);
        return () => disconnectSocket();
    }, [token]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                setIsLoading(true);
                const response = await getMyConversations();
                if (response && response.result) {
                    const formattedChats = response.result.map((conv) => ({
                        id: conv.id,
                        name: conv.conversationName || 'Khách hàng',
                        avatar: conv.conversationAvatar,
                        lastMessage: conv.lastMessage || 'Đã kết nối...',
                        time: formatTime(conv.updatedAt || conv.createdAt),
                        unread: conv.unread || 0,
                        type: conv.type?.toLowerCase() || 'selling',
                        postId: conv.postId,
                        postTitle: conv.postTitle,
                        postImage: conv.postImage,
                        postPrice: conv.postPrice,
                        isMyPost: conv.isMyPost
                    }));
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
                    setMessages(response.result.reverse().map(normalizeMessage));
                    setChats((prevChats) => prevChats.map((chat) =>
                        String(chat.id) === String(activeChatId) ? { ...chat, unread: 0 } : chat
                    ));
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách tin nhắn:', error);
            }
        };

        fetchMessages();
        joinConversation(activeChatId);

        subscribeToNewMessages((newMessage) => {
            try {
                const parsedMessage = typeof newMessage === 'string' ? JSON.parse(newMessage) : newMessage;
                const normalizedMessage = normalizeMessage(parsedMessage);
                const isCurrentChat = String(normalizedMessage.conversationId) === String(activeChatId);

                if (isCurrentChat) {
                    setMessages((prev) => {
                        const existingIndex = prev.findIndex((m) => String(m.id) === String(normalizedMessage.id));
                        if (existingIndex !== -1) {
                            const next = [...prev];
                            next[existingIndex] = { ...next[existingIndex], ...normalizedMessage };
                            return next;
                        }
                        return [...prev, normalizedMessage];
                    });
                }

                setChats((prevChats) => prevChats.map((chat) =>
                    String(chat.id) === String(normalizedMessage.conversationId)
                        ? {
                              ...chat,
                              lastMessage: normalizedMessage.message || chat.lastMessage,
                              time: formatTime(normalizedMessage.createdDate || normalizedMessage.createdAt || Date.now()),
                              unread: isCurrentChat ? 0 : (chat.unread || 0) + 1
                          }
                        : chat
                ));
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

    // --- 3. HANDLERS ---
    const handleChatSelect = (chatId) => {
        setActiveChatId(chatId);
        setChats((prev) => prev.map((chat) => String(chat.id) === String(chatId) ? { ...chat, unread: 0 } : chat));
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeChatId || isSending) return;
        const trimmedMessage = messageInput.trim();
        setMessageInput('');
        setIsSending(true);

        try {
            const response = await createChatMessage({ conversationId: activeChatId, message: trimmedMessage });
            if (response.code === 1000 && response.result) {
                const newlySentMessage = normalizeMessage({ ...response.result, me: true });
                setMessages((prev) => {
                    const existingIndex = prev.findIndex((m) => String(m.id) === String(newlySentMessage.id));
                    if (existingIndex !== -1) {
                        const next = [...prev];
                        next[existingIndex] = { ...next[existingIndex], ...newlySentMessage };
                        return next;
                    }
                    return [...prev, newlySentMessage];
                });

                setChats((prev) => prev.map((chat) =>
                    String(chat.id) === String(activeChatId)
                        ? { ...chat, lastMessage: newlySentMessage.message, time: formatTime(newlySentMessage.createdDate || newlySentMessage.createdAt), unread: 0 }
                        : chat
                ));
            }
        } catch (error) {
            toast.error('Gửi tin nhắn thất bại!');
        } finally {
            setIsSending(false);
        }
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
            // Tinh chỉnh payload khớp với OrderRequest (Backend)
            const payload = {
                // Sửa lại: Cần truyền đúng ID của người bán (không phải ID đoạn chat)
                sellerId: String(currentChat?.userId || currentChat?.id || ''), 
                // Thêm buyerId là ID của người đang đăng nhập
                buyerId: String(currentUserId || ''), 
                postId: String(currentChat?.postId || ''),
                method: orderForm.method, // Đảm bảo trùng khớp với PaymentMethodEnum (MIDDLEMAN / DIRECT)
                receiverName: orderForm.receiverName,
                receiverPhone: orderForm.receiverPhone,
                shippingAddress: orderForm.shippingAddress
                
                // Đã xóa buyerBank và sellerBank vì Backend đang comment các trường này
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

    const filteredChats = chats.filter((chat) => {
        const matchSearch = chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) || chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchSearch) return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return chat.unread > 0;
        return chat.type === activeTab;
    });

    // --- 4. RENDER UI TỔNG ---
    return (
        <div className={cx('chat-layout')}>
            <Sidebar 
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                activeTab={activeTab} setActiveTab={setActiveTab}
                isLoading={isLoading} filteredChats={filteredChats}
                activeChatId={activeChatId} handleChatSelect={handleChatSelect}
            />
            
            <ChatWindow 
                activeChatId={activeChatId} currentChat={currentChat}
                messages={messages} currentUserId={currentUserId}
                messagesEndRef={messagesEndRef} messageInput={messageInput}
                setMessageInput={setMessageInput} isSending={isSending}
                handleSendMessage={handleSendMessage} setIsOrderModalOpen={setIsOrderModalOpen}
            />

            {isOrderModalOpen && (
                <OrderModal 
                    currentChat={currentChat} orderForm={orderForm}
                    setOrderForm={setOrderForm} submitOrderRequest={submitOrderRequest}
                    isSubmittingOrder={isSubmittingOrder} close={() => setIsOrderModalOpen(false)}
                />
            )}
        </div>
    );
}

export default ChatPage;

// ==========================================
// SUB-COMPONENTS (Tách nhỏ để code dễ đọc hơn)
// ==========================================

const Sidebar = ({ searchQuery, setSearchQuery, activeTab, setActiveTab, isLoading, filteredChats, activeChatId, handleChatSelect }) => (
    <div className={cx('sidebar')}>
        <div className={cx('search-area')}>
            <div className={cx('search-box')}>
                <FiSearch className={cx('icon')} />
                <input type="text" placeholder="Tìm kiếm tin nhắn..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
        </div>
        <div className={cx('filter-tabs')}>
            {FILTER_TABS.map((tab) => (
                <button key={tab.key} className={cx('tab-item', { active: activeTab === tab.key })} onClick={() => setActiveTab(tab.key)}>
                    {tab.label}
                </button>
            ))}
        </div>
        <div className={cx('conversation-list')}>
            {isLoading ? <div className={cx('empty-state')}>Đang tải tin nhắn...</div> 
            : filteredChats.length > 0 ? filteredChats.map((chat) => (
                <div key={chat.id} className={cx('chat-item', { active: String(activeChatId) === String(chat.id) })} onClick={() => handleChatSelect(chat.id)}>
                    <div className={cx('avatar')}>
                        {chat.avatar ? <img src={chat.avatar} alt="avatar" /> : chat.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className={cx('chat-info')}>
                        <div className={cx('row-top')}>
                            <span className={cx('name')}>{chat.name}</span>
                            <span className={cx('time')}>{chat.time}</span>
                        </div>
                        <div className={cx('row-bottom')}>
                            <span className={cx('last-message', { unread: chat.unread > 0 })}>{chat.lastMessage}</span>
                            {chat.unread > 0 && <span className={cx('unread-badge')}>{chat.unread}</span>}
                        </div>
                    </div>
                </div>
            )) : <div className={cx('empty-state')}>Không có tin nhắn nào.</div>}
        </div>
    </div>
);

const ChatWindow = ({ activeChatId, currentChat, messages, messagesEndRef, messageInput, setMessageInput, isSending, handleSendMessage, setIsOrderModalOpen }) => {
    if (!activeChatId) return (
        <div className={cx('chat-area')}><div className={cx('no-chat-selected')}>
            <div className={cx('icon-wrapper')}><FiMessageCircle size={48} color="#0084ff" /></div>
            <h3>Chào mừng đến với TapHoa2Hand Chat</h3>
            <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin hoặc tìm kiếm ở thanh bên trái.</p>
        </div></div>
    );

    return (
        <div className={cx('chat-area')}>
            {/* Header */}
            <div className={cx('chat-header')}>
                <div className={cx('user-info')}>
                    <div className={cx('avatar')}>
                        {currentChat?.avatar ? <img src={currentChat.avatar} alt="avatar" /> : currentChat?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div><div className={cx('name')}>{currentChat?.name}</div><div className={cx('status')}>Đang hoạt động</div></div>
                </div>
                <div className={cx('actions')}><button><FiMoreVertical size={20} /></button></div>
            </div>

            {/* Pinned Product */}
            {currentChat?.postId && (
                <div className={cx('pinned-product')}>
                    <div className={cx('product-image')}><img src={getProductImageUrl(currentChat.postImage)} alt="Product" /></div>
                    <div className={cx('product-info')}>
                        <span className={cx('title')}><FiTag size={16} /><span>{currentChat.postTitle || 'Sản phẩm đang trao đổi'}</span></span>
                        <span className={cx('price')}>{formatPrice(currentChat.postPrice)}</span>
                        <span className={cx('id')}>ID: {currentChat.postId}</span>
                    </div>
                    <div className={cx('product-actions')}>
                        {!currentChat.isMyPost && <button className={cx('btn-primary')} onClick={() => setIsOrderModalOpen(true)}>Yêu cầu giao dịch</button>}
                        <button className={cx('btn-secondary')}>Xem bài</button>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className={cx('messages-container')}>
                {messages.length === 0 ? <div className={cx('welcome-text')}>Bắt đầu trò chuyện với {currentChat?.name}</div> 
                : messages.map((msg) => (
                    <div key={msg.id} className={cx('message-wrapper', { 'is-me': msg.me })}>
                        {!msg.me && (
                            <div className={cx('msg-avatar')}>
                                {msg.sender?.avatar ? <img src={msg.sender.avatar} alt="avatar" /> 
                                : <div>{(msg.sender?.fullName || msg.sender?.username || '?').charAt(0).toUpperCase()}</div>}
                            </div>
                        )}
                        <div className={cx('msg-content')}>
                            {!msg.me && <span className={cx('sender-name')}>{msg.sender?.fullName || msg.sender?.username || 'Khách hàng'}</span>}
                            <div className={cx('bubble')}>{msg.message}</div>
                            <span className={cx('time')}>{formatTime(msg.createdDate || msg.createdAt)}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={cx('chat-input')}>
                <button className={cx('action-btn')}><FiPaperclip size={20} /></button>
                <button className={cx('action-btn')}><FiImage size={20} /></button>
                <input type="text" placeholder="Nhập tin nhắn..." value={messageInput} 
                    onChange={(e) => setMessageInput(e.target.value)} disabled={isSending} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                />
                <button className={cx('send-btn', { active: messageInput.trim().length > 0 })} onClick={handleSendMessage} disabled={isSending || !messageInput.trim()}>
                    <FiSend size={20} />
                </button>
            </div>
        </div>
    );
};

const OrderModal = ({ currentChat, orderForm, setOrderForm, submitOrderRequest, isSubmittingOrder, close }) => {
    const handleChange = (e) => setOrderForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('modal-content')}>
                <h2>Yêu Cầu Giao Dịch</h2>
                <div className={cx('product-summary')}>
                    <strong>Sản phẩm:</strong> {currentChat?.postTitle} <br />
                    <strong>Giá:</strong> <span>{formatPrice(currentChat?.postPrice)}</span>
                </div>
                <form onSubmit={submitOrderRequest}>
                    <div className={cx('form-section')}>
                        <strong>1. Thông tin nhận hàng</strong>
                        <input required type="text" name="receiverName" value={orderForm.receiverName} onChange={handleChange} placeholder="Tên người nhận" />
                        <input required type="text" name="receiverPhone" value={orderForm.receiverPhone} onChange={handleChange} placeholder="Số điện thoại" />
                        <textarea required name="shippingAddress" value={orderForm.shippingAddress} onChange={handleChange} placeholder="Địa chỉ giao hàng..." />
                    </div>
                    <div className={cx('form-section')}>
                        <strong>2. Phương thức giao dịch</strong>
                        <select name="method" value={orderForm.method} onChange={handleChange}>
                            <option value="MIDDLEMAN">Giao dịch qua Trung gian (An toàn)</option>
                            <option value="DIRECT">Giao dịch Trực tiếp (Tự thỏa thuận)</option>
                        </select>
                    </div>
                    {orderForm.method === 'MIDDLEMAN' && (
                        <div className={cx('form-section')}>
                            <strong>3. Thông tin ngân hàng của bạn</strong>
                            <input type="text" name="bankName" value={orderForm.bankName} onChange={handleChange} placeholder="Tên Ngân Hàng (VD: Vietcombank)" />
                            <input type="text" name="accountName" value={orderForm.accountName} onChange={handleChange} placeholder="Tên chủ tài khoản" />
                            <input type="text" name="accountNumber" value={orderForm.accountNumber} onChange={handleChange} placeholder="Số tài khoản" />
                        </div>
                    )}
                    <div className={cx('modal-actions')}>
                        <button type="button" onClick={close} className={cx('btn-cancel')}>Hủy</button>
                        <button type="submit" disabled={isSubmittingOrder} className={cx('btn-submit')}>
                            {isSubmittingOrder ? 'Đang gửi...' : 'Xác nhận gửi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};