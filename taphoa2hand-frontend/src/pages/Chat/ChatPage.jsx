import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import { 
    FiSearch, 
    FiSend, 
    FiImage, 
    FiPaperclip, 
    FiMoreVertical,
    FiInfo
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
    subscribeToNewMessages 
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
    const [activeChatId, setActiveChatId] = useState(null);

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

    // ==========================================
    // 2. EFFECTS TÍCH HỢP SOCKET & GỌI API
    // ==========================================

    // Effect 2.1: Quản lý kết nối Socket tổng thể
    useEffect(() => {
        if (token) {
            initiateSocketConnection(token);
        }

        // Cleanup: Ngắt kết nối khi rời khỏi trang Chat
        return () => {
            disconnectSocket();
        };
    }, [token]);

    // Effect 2.2: Lấy danh sách Sidebar (Các cuộc hội thoại)
    useEffect(() => {
        const fetchChats = async () => {
            try {
                setIsLoading(true);
                const response = await getMyConversations();
                if (response && response.result) {
                    const formattedChats = response.result.map(conv => {
                        const chatName = conv.conversationName || "Khách hàng"; 
                        const timeString = conv.updatedAt || conv.createdAt;
                        const displayTime = timeString ? new Date(timeString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                        
                        return {
                            id: conv.id,
                            name: chatName,
                            avatar: conv.conversationAvatar,
                            lastMessage: 'Đã kết nối...', 
                            time: displayTime,
                            unread: 0,
                            type: conv.type?.toLowerCase() || 'selling',
                            rawParticipants: conv.participants
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

    // Effect 2.3: Lấy tin nhắn và quản lý Room Socket khi chọn hội thoại
    useEffect(() => {
        if (!activeChatId) return;

        // B1: Gọi API lấy lịch sử tin nhắn
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

        // B2: Báo cho server socket biết client đã tham gia phòng này
        joinConversation(activeChatId);

        // B3: Lắng nghe tin nhắn mới từ socket trả về (ĐÃ FIX LỖI Ở ĐÂY)
        subscribeToNewMessages((newMessage) => {
            console.log("Socket nhận tin nhắn mới:", newMessage);
            
            // Chuẩn hóa dữ liệu nếu Backend chỉ gửi chuỗi String
            let formattedMessage = newMessage;
            if (typeof newMessage === 'string') {
                formattedMessage = {
                    id: Date.now() + Math.random(), // Tạo ID tạm thời để React render
                    message: newMessage,
                    me: false, // Tin nhận qua socket từ người khác thì me = false
                    conversationId: activeChatId 
                };
            }

            // Tạm thời bỏ qua if check conversationId nếu Backend không gửi kèm
            // Chỉ cần biết đang mở chat nào thì append tin nhắn vào chat đó
            setMessages(prev => {
                const isExist = prev.find(m => m.id === formattedMessage.id);
                if (isExist) return prev;
                return [...prev, formattedMessage];
            });

            // Cập nhật lại dòng tin nhắn cuối ở sidebar
            setChats(prevChats => prevChats.map(chat => 
                chat.id === activeChatId 
                    ? { ...chat, lastMessage: formattedMessage.message }
                    : chat
            ));
        });

        // Cleanup: Rời phòng cũ khi đổi chat hoặc unmount component
        return () => {
            leaveConversation(activeChatId);
        };
    }, [activeChatId]);

    // Effect 2.4: Tự động scroll xuống cuối mỗi khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ==========================================
    // 3. HANDLERS (XỬ LÝ SỰ KIỆN)
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
                // Đẩy ngay lên UI để tạo cảm giác mượt mà
                setMessages(prev => {
                    const isExist = prev.find(m => m.id === response.result.id);
                    if (isExist) return prev;
                    return [...prev, response.result];
                });
                
                setChats(prevChats => prevChats.map(chat => 
                    chat.id === activeChatId 
                        ? { ...chat, lastMessage: response.result.message }
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
    // 4. RENDER HELPERS
    // ==========================================

    const filteredChats = chats.filter(chat => {
        const matchSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchSearch) return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return chat.unread > 0;
        return chat.type === activeTab;
    });

    const currentChat = chats.find(c => c.id === activeChatId);

    return (
        <div className={cx('chat-layout')}>
            {/* ---------------- CỘT TRÁI: DANH SÁCH CHAT ---------------- */}
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
                                className={cx('chat-item', { active: activeChatId === chat.id })}
                                onClick={() => setActiveChatId(chat.id)}
                            >
                                <div className={cx('avatar')}>
                                    {chat.avatar ? (
                                        <img src={chat.avatar} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
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
            <div className={cx('chat-area')}>
                {activeChatId ? (
                    <>
                        <div className={cx('chat-header')}>
                            <div className={cx('user-info')}>
                                <div className={cx('avatar')}>
                                    {currentChat?.avatar ? (
                                        <img src={currentChat.avatar} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
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

                        <div className={cx('messages-container')} style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            {messages.length === 0 ? (
                                <div className={cx('welcome-text')} style={{ textAlign: 'center', marginTop: '20px' }}>
                                    Bắt đầu trò chuyện với {currentChat?.name}
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={cx('message-bubble')}
                                        style={{
                                            alignSelf: msg.me ? 'flex-end' : 'flex-start',
                                            backgroundColor: msg.me ? '#0084ff' : '#e4e6eb',
                                            color: msg.me ? '#fff' : '#000',
                                            padding: '8px 12px',
                                            borderRadius: '16px',
                                            margin: '4px 8px',
                                            maxWidth: '70%',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        <span>{msg.message}</span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className={cx('chat-input-area')}>
                            <button className={cx('btn-icon')}><FiPaperclip size={20} /></button>
                            <button className={cx('btn-icon')}><FiImage size={20} /></button>
                            <input 
                                type="text" 
                                placeholder="Nhập tin nhắn..." 
                                className={cx('msg-input')} 
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isSending}
                            />
                            <button 
                                className={cx('btn-send')} 
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim() || isSending}
                            >
                                <FiSend size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={cx('no-chat-selected')}>
                        <div className={cx('icon-wrapper')}>
                            <FiInfo size={40} />
                        </div>
                        <h3>Chào mừng đến với Tin nhắn</h3>
                        <p>Hãy chọn một cuộc hội thoại ở cột bên trái để bắt đầu trò chuyện.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;