import React from 'react';
import classNames from 'classnames/bind';
import { FiSearch } from 'react-icons/fi';
import styles from '../ChatPage.module.scss';

const cx = classNames.bind(styles);

const FILTER_TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc' },
    { key: 'buying', label: 'Mua' },
    { key: 'selling', label: 'Bán' },
    { key: 'hidden', label: 'Đã ẩn' }
];

function Sidebar({ 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab, 
    isLoading, 
    filteredChats, 
    activeChatId, 
    handleChatSelect,
    onlineUsers = new Set()
}) {
    return (
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
                            className={cx('chat-item', { active: String(activeChatId) === String(chat.id) })} 
                            onClick={() => handleChatSelect(chat.id)}
                        >
                            <div className={cx('avatar-wrapper')}>
                                {chat.avatar ? (
                                    <img src={chat.avatar} alt="avatar" className={cx('avatar-img')} />
                                ) : (
                                    <div className={cx('avatar-placeholder')}>
                                        {chat.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {/* Online dot indicator */}
                                {onlineUsers.has(chat.userId) && (
                                    <span className={cx('online-dot')} />
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
    );
}

export default Sidebar;