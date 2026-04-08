import React, { useState, useEffect } from 'react';
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
// Import API của bạn vào đây (Sửa đường dẫn cho đúng với project của bạn)
import { getMyConversations } from '../../services/chatService';

const cx = classNames.bind(styles);

function ChatPage() {
    // State quản lý dữ liệu chat từ API
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State quản lý UI
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChatId, setActiveChatId] = useState(null);

    // Danh sách bộ lọc
    const FILTER_TABS = [
        { key: 'all', label: 'Tất cả' },
        { key: 'unread', label: 'Chưa đọc' },
        { key: 'buying', label: 'Mua' },
        { key: 'selling', label: 'Bán' },
        { key: 'hidden', label: 'Đã ẩn' },
    ];

    // Gọi API lấy danh sách hội thoại
    useEffect(() => {
        const fetchChats = async () => {
            try {
                setIsLoading(true);
                const response = await getMyConversations();
                
                // Kiểm tra nếu API trả về thành công
                if (response && response.result) {
                    // Map dữ liệu từ Backend (ConversationResponse) sang format của UI
                    const formattedChats = response.result.map(conv => {
                        // Lấy tên đối tác chat (Nếu conversationName null thì lấy tên participant)
                        const chatName = conv.conversationName || "Khách hàng"; 
                        
                        // Format lại thời gian
                        const timeString = conv.updatedAt || conv.createdAt;
                        const displayTime = timeString ? new Date(timeString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

                        return {
                            id: conv.id,
                            name: chatName,
                            avatar: conv.conversationAvatar,
                            // Tạm thời để placeholder vì backend Response chưa có tin nhắn cuối cùng
                            lastMessage: 'Đã kết nối, hãy bắt đầu trò chuyện...', 
                            time: displayTime,
                            unread: 0, // Cập nhật sau khi backend có số lượng tin nhắn chưa đọc
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

    // Lọc danh sách chat dựa trên Tab và Search
    const filteredChats = chats.filter(chat => {
        const matchSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchSearch) return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return chat.unread > 0;
        return chat.type === activeTab;
    });

    // Lấy thông tin user đang được chọn để hiển thị bên phải
    const currentChat = chats.find(c => c.id === activeChatId);

    return (
        <div className={cx('chat-layout')}>
            {/* CỘT TRÁI: DANH SÁCH CHAT */}
            <div className={cx('sidebar')}>
                {/* Thanh tìm kiếm */}
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

                {/* Bộ lọc 5 loại */}
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

                {/* Danh sách Conversation */}
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
                                    {/* Ưu tiên hiện ảnh avatar nếu có, nếu không lấy chữ cái đầu */}
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

            {/* CỘT PHẢI: KHU VỰC NHẮN TIN */}
            <div className={cx('chat-area')}>
                {activeChatId ? (
                    <>
                        {/* Header của khung chat */}
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

                        {/* Nội dung đoạn chat (Hiện tại để trống) */}
                        <div className={cx('messages-container')}>
                            <div className={cx('welcome-text')}>
                                Bắt đầu trò chuyện với {currentChat?.name}
                            </div>
                            {/* Chỗ này sau sẽ map mảng tin nhắn thật vào */}
                        </div>

                        {/* Ô nhập tin nhắn */}
                        <div className={cx('chat-input-area')}>
                            <button className={cx('btn-icon')}><FiPaperclip size={20} /></button>
                            <button className={cx('btn-icon')}><FiImage size={20} /></button>
                            <input type="text" placeholder="Nhập tin nhắn..." className={cx('msg-input')} />
                            <button className={cx('btn-send')}><FiSend size={18} /></button>
                        </div>
                    </>
                ) : (
                    // Trạng thái khi chưa chọn người để chat
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