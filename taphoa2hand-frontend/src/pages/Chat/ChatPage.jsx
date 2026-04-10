import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { 
    FiSearch, 
    FiSend, 
    FiImage, 
    FiPaperclip, 
    FiMoreVertical,
    FiInfo,
    FiMessageCircle,
    FiTag
} from 'react-icons/fi';
import styles from './ChatPage.module.scss';

// Import các hàm gọi API
import { getMyConversations, getChatMessages, createChatMessage } from '../../services/chatService';

// Import các hàm quản lý Socket
import { 
    initiateSocketConnection, 
    disconnectSocket, 
    joinConversation, 
    leaveConversation, 
    subscribeToNewMessages,
    unsubscribeFromMessages 
} from '../../services/socketService';

const cx = classNames.bind(styles);

function ChatPage() {
    // ==========================================
    // 1. STATE QUẢN LÝ DỮ LIỆU
    // ==========================================
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Đọc ID từ URL
    const [searchParams] = useSearchParams();
    const urlActiveId = searchParams.get('activeId');

    const [activeChatId, setActiveChatId] = useState(urlActiveId || null);

    // State cho khu vực nhắn tin
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token'); 

    const FILTER_TABS = [
        { key: 'all', label: 'Tất cả' },
        { key: 'unread', label: 'Chưa đọc' },
        { key: 'buying', label: 'Mua' },
        { key: 'selling', label: 'Bán' },
        { key: 'hidden', label: 'Đã ẩn' },
    ];

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    // ==========================================
    // 2. EFFECTS TÍCH HỢP SOCKET & GỌI API
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
                    const formattedChats = response.result.map(conv => {
                        const chatName = conv.conversationName || "Khách hàng"; 
                        const timeString = conv.updatedAt || conv.createdAt;
                        
                        return {
                            id: conv.id,
                            name: chatName,
                            avatar: conv.conversationAvatar,
                            lastMessage: 'Đã kết nối...', 
                            time: formatTime(timeString),
                            unread: 0,
                            type: conv.type?.toLowerCase() || 'selling',
                            // Lấy thêm thông tin sản phẩm để ghim
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
                console.error("Lỗi khi lấy danh sách đoạn chat:", error);
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
                    const sortedMessages = response.result.reverse();
                    setMessages(sortedMessages);
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách tin nhắn:", error);
            }
        };
        fetchMessages();

        joinConversation(activeChatId);

        subscribeToNewMessages((newMessage) => {
            try {
                const parsedMessage = typeof newMessage === 'string' ? JSON.parse(newMessage) : newMessage;
                const isCurrentChat = String(parsedMessage.conversationId) === String(activeChatId);

                if (isCurrentChat) {
                    setMessages(prev => {
                        const isExist = prev.some(m => String(m.id) === String(parsedMessage.id));
                        if (isExist) return prev;
                        return [...prev, parsedMessage];
                    });
                }

                setChats(prevChats => prevChats.map(chat => 
                    String(chat.id) === String(parsedMessage.conversationId) 
                        ? { 
                            ...chat, 
                            lastMessage: parsedMessage.message,
                            time: formatTime(parsedMessage.createdDate || Date.now()),
                            unread: isCurrentChat ? chat.unread : (chat.unread || 0) + 1
                          }
                        : chat
                ));
            } catch (error) {
                console.error("Lỗi khi parse dữ liệu:", error);
            }
        });

        return () => {
            leaveConversation(activeChatId);
            unsubscribeFromMessages();
        };
    }, [activeChatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ==========================================
    // 3. HANDLERS
    // ==========================================

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeChatId || isSending) return;

        const requestBody = {
            conversationId: activeChatId,
            message: messageInput.trim()
        };

        setMessageInput('');
        setIsSending(true);

        try {
            const response = await createChatMessage(requestBody);
            
            if (response.code === 1000 && response.result) {
                const newlySentMessage = { ...response.result, me: true };

                setMessages(prev => {
                    const isExist = prev.some(m => String(m.id) === String(newlySentMessage.id));
                    if (isExist) return prev;
                    return [...prev, newlySentMessage];
                });
                
                setChats(prevChats => prevChats.map(chat => 
                    String(chat.id) === String(activeChatId) 
                        ? { ...chat, lastMessage: newlySentMessage.message, time: formatTime(newlySentMessage.createdDate) }
                        : chat
                ));
            }
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
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

    // ==========================================
    // 4. RENDER
    // ==========================================

    const filteredChats = chats.filter(chat => {
        const matchSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchSearch) return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return chat.unread > 0;
        return chat.type === activeTab;
    });

    const currentChat = chats.find(c => String(c.id) === String(activeChatId));

    // Lấy link ảnh đầu tiên của sản phẩm (xử lý an toàn nếu data là mảng hoặc chuỗi)
    const getProductImageUrl = (postImage) => {
        if (!postImage) return 'https://via.placeholder.com/50';
        if (Array.isArray(postImage) && postImage.length > 0) return postImage[0].url || postImage[0];
        if (typeof postImage === 'string') return postImage;
        return 'https://via.placeholder.com/50';
    };
// 1. THÊM HÀM FORMAT GIÁ TIỀN
    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Thỏa thuận';
        const num = Number(price);
        if (isNaN(num)) return price; // Nếu giá đã là chữ (ví dụ "Liên hệ") thì giữ nguyên
        return num.toLocaleString('vi-VN') + ' đ';
    };

    // 2. THÊM HÀM XỬ LÝ KHI BẤM NÚT YÊU CẦU GIAO DỊCH
    const handleRequestTransaction = () => {
        // Gọi API tạo yêu cầu giao dịch ở đây
        console.log("Đã bấm yêu cầu giao dịch cho postId:", currentChat?.postId);
        alert("Tính năng yêu cầu giao dịch đang được cập nhật!");
    };
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
                    {FILTER_TABS.map(tab => (
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
                        filteredChats.map(chat => (
                            <div 
                                key={chat.id} 
                                className={cx('chat-item', { active: String(activeChatId) === String(chat.id) })}
                                onClick={() => setActiveChatId(chat.id)}
                            >
                                <div className={cx('avatar')}>
                                    {chat.avatar ? (
                                        <img src={chat.avatar} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                                    ) : (
                                        chat.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className={cx('chat-info')}>
                                    <div className={cx('row-top')}>
                                        <span className={cx('name')}>{chat.name}</span>
                                        <span className={cx('time')}>{chat.time}</span>
                                    </div>
                                    <div className={cx('row-bottom')}>
                                        <span className={cx('last-message', { unread: chat.unread > 0 })}>
                                            {chat.lastMessage}
                                        </span>
                                        {chat.unread > 0 && (
                                            <span className={cx('unread-badge')}>{chat.unread}</span>
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

            {/* ---------------- CỘT PHẢI: KHU VỰC NHẮN TIN ---------------- */}
            <div className={cx('chat-area')} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {activeChatId ? (
                    <>
                        {/* 1. HEADER CHAT */}
                        <div className={cx('chat-header')} style={{ flexShrink: 0 }}>
                            <div className={cx('user-info')}>
                                <div className={cx('avatar')}>
                                    {currentChat?.avatar ? (
                                        <img src={currentChat.avatar} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                                    ) : (
                                        currentChat?.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className={cx('name')}>{currentChat?.name}</div>
                                    <div className={cx('status')}>Đang hoạt động</div>
                                </div>
                            </div>
                            <div className={cx('actions')}>
                                <button><FiMoreVertical size={20}/></button>
                            </div>
                        </div>

                       {/* 2. KHU VỰC GHIM SẢN PHẨM (Chỉ hiện nếu có postId) */}
                        {currentChat?.postId && (
                            <div style={{
                                padding: '10px 20px',
                                backgroundColor: '#f0f2f5',
                                borderBottom: '1px solid #e4e6eb',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flexShrink: 0
                            }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    borderRadius: '8px', 
                                    overflow: 'hidden', 
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    flexShrink: 0
                                }}>
                                    <img 
                                        src={getProductImageUrl(currentChat.postImage)} 
                                        alt="Product" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <span style={{ fontWeight: '600', fontSize: '15px', color: '#050505', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FiTag size={16} color="#0084ff"/>
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                            {currentChat.postTitle || 'Sản phẩm đang trao đổi'}
                                        </span>
                                    </span>
                                    <span style={{ fontWeight: '600', fontSize: '15px', color: '#e53935', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        
                                        {/* GỌI HÀM FORMAT GIÁ Ở ĐÂY */}
                                        {formatPrice(currentChat.postPrice)}
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#65676B' }}>ID: {currentChat.postId}</span>
                                </div>
                                
                                {/* THÊM NHÓM NÚT BẤM (GIAO DỊCH & XEM BÀI) */}
                                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
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
                                            onMouseOver={(e) => e.target.style.backgroundColor = '#0073e6'}
                                            onMouseOut={(e) => e.target.style.backgroundColor = '#0084ff'}
                                        >
                                            Yêu cầu giao dịch
                                        </button>
                                    )}
                                    <button style={{
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
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#d8dadf'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#e4e6eb'}
                                    >
                                        Xem bài
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3. KHU VỰC TIN NHẮN */}
                        <div className={cx('messages-container')} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '20px' }}>
                            {messages.length === 0 ? (
                                <div className={cx('welcome-text')} style={{ textAlign: 'center', marginTop: '20px', color: '#65676B' }}>
                                    Bắt đầu trò chuyện với {currentChat?.name}
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div 
                                        key={msg.id}
                                        style={{
                                            display: 'flex',
                                            alignSelf: msg.me ? 'flex-end' : 'flex-start',
                                            flexDirection: msg.me ? 'row-reverse' : 'row',
                                            alignItems: 'flex-end',
                                            gap: '8px',
                                            margin: '8px 0',
                                            maxWidth: '80%'
                                        }}
                                    >
                                        {!msg.me && (
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e4e6eb', flexShrink: 0, overflow: 'hidden' }}>
                                                {msg.sender?.avatar ? (
                                                    <img src={msg.sender.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#65676B' }}>
                                                        {(msg.sender?.fullName || msg.sender?.username || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.me ? 'flex-end' : 'flex-start' }}>
                                            {!msg.me && (
                                                <span style={{ fontSize: '12px', color: '#65676B', marginBottom: '4px', marginLeft: '4px' }}>
                                                    {msg.sender?.fullName || msg.sender?.username || 'Khách hàng'}
                                                </span>
                                            )}

                                            <div style={{
                                                padding: '10px 14px',
                                                borderRadius: '18px',
                                                backgroundColor: msg.me ? '#0084ff' : '#e4e6eb',
                                                color: msg.me ? '#fff' : '#050505',
                                                wordBreak: 'break-word',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {msg.message}
                                            </div>
                                            
                                            <span style={{ fontSize: '11px', color: '#8a8d91', marginTop: '4px', marginRight: msg.me ? '4px' : '0', marginLeft: !msg.me ? '4px' : '0' }}>
                                                {formatTime(msg.createdDate)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 4. THANH NHẬP TIN NHẮN */}
                        <div className={cx('chat-input')} style={{ flexShrink: 0 }}>
                            <button className={cx('action-btn')}><FiPaperclip size={20}/></button>
                            <button className={cx('action-btn')}><FiImage size={20}/></button>
                            <input 
                                type="text" 
                                placeholder="Nhập tin nhắn..." 
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isSending}
                            />
                            <button 
                                className={cx('send-btn', { active: messageInput.trim().length > 0 })}
                                onClick={handleSendMessage}
                                disabled={isSending || !messageInput.trim()}
                            >
                                <FiSend size={20}/>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={cx('no-chat-selected')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#65676B' }}>
                        <div className={cx('icon-wrapper')} style={{ marginBottom: '16px' }}><FiMessageCircle size={48} color="#0084ff"/></div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#050505' }}>Chào mừng đến với TapHoa2Hand Chat</h3>
                        <p style={{ margin: 0 }}>Chọn một cuộc trò chuyện để bắt đầu nhắn tin hoặc tìm kiếm ở thanh bên trái.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;