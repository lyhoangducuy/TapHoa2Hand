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
    
    // Dùng để tự động cuộn khung chat xuống cuối
    const messagesEndRef = useRef(null);

    const FILTER_TABS = [
        { key: 'all', label: 'Tất cả' },
        { key: 'unread', label: 'Chưa đọc' },
        { key: 'buying', label: 'Mua' },
        { key: 'selling', label: 'Bán' },
        { key: 'hidden', label: 'Đã ẩn' },
    ];

    // ==========================================
    // 2. EFFECTS (GỌI API VÀ XỬ LÝ GIAO DIỆN)
    // ==========================================

    // Lấy danh sách Sidebar (Các cuộc hội thoại)
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
                            lastMessage: 'Đã kết nối, hãy bắt đầu trò chuyện...', 
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

    // Lấy danh sách tin nhắn khi click chọn 1 cuộc hội thoại
    useEffect(() => {
        if (!activeChatId) return;

        const fetchMessages = async () => {
            try {
                const response = await getChatMessages(activeChatId);
                if (response.code === 1000 && response.result) {
                    // Đảo ngược mảng để tin nhắn cũ ở trên, mới ở dưới (Do Backend đang sort DESC)
                    const sortedMessages = response.result.reverse();
                    setMessages(sortedMessages);
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách tin nhắn:", error);
            }
        };

        fetchMessages();
    }, [activeChatId]);

    // Tự động scroll xuống cuối mỗi khi có tin nhắn mới hoặc mới load xong tin nhắn
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

        // Clear input ngay lập tức tạo cảm giác mượt mà cho user
        setMessageInput('');
        setIsSending(true);

        try {
            const response = await createChatMessage(requestBody);
            if (response.code === 1000 && response.result) {
                // Đẩy tin nhắn vừa gửi thành công vào mảng hiển thị
                setMessages(prev => [...prev, response.result]);
                
                // Cập nhật lại dòng text ở sidebar bên trái
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

    // Cho phép ấn Enter để gửi tin nhắn
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
                                            // Tạm dùng inline-style để bạn thấy rõ logic, bạn có thể chuyển css này vào file .scss
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
                            {/* Khối div ẩn này giúp tự động cuộn màn hình xuống đoạn text dưới cùng */}
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