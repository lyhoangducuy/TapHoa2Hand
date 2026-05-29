import React from 'react';
import classNames from 'classnames/bind';
import { FiImage, FiVideo } from 'react-icons/fi';
import styles from '../ChatPage.module.scss';

const cx = classNames.bind(styles);

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit'
    });
};

function ChatMessages({ messages, currentUserId, messagesEndRef }) {
    const getSenderId = (msg) => msg?.sender?.id || msg?.senderId || msg?.userId || msg?.createdBy || null;

    const isMe = (msg) => {
        const senderId = getSenderId(msg);
        return String(senderId) === String(currentUserId) || msg.me;
    };

    const renderMedia = (msg) => {
        if (!msg.mediaUrl || !msg.mediaType) return null;

        if (msg.mediaType === 'IMAGE') {
            return (
                <div className={cx('media-container')}>
                    <img 
                        src={msg.mediaUrl} 
                        alt="Hình ảnh" 
                        className={cx('media-image')}
                        onClick={() => window.open(msg.mediaUrl, '_blank')}
                    />
                </div>
            );
        }

        if (msg.mediaType === 'VIDEO') {
            return (
                <div className={cx('media-container')}>
                    <video 
                        src={msg.mediaUrl} 
                        controls 
                        className={cx('media-video')}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <div className={cx('messages-container')}>
            {messages.length === 0 ? (
                <div className={cx('welcome-text')}>Bắt đầu trò chuyện</div>
            ) : (
                messages.map((msg) => (
                    <div key={msg.id} className={cx('message-wrapper', { 'is-me': isMe(msg) })}>
                        {!isMe(msg) && (
                            <div className={cx('msg-avatar')}>
                                {msg.sender?.avatar ? (
                                    <img src={msg.sender.avatar} alt="avatar" />
                                ) : (
                                    <div>
                                        {(msg.sender?.fullName || msg.sender?.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className={cx('msg-content')}>
                            {!isMe(msg) && (
                                <span className={cx('sender-name')}>
                                    {msg.sender?.fullName || msg.sender?.username || 'Khách hàng'}
                                </span>
                            )}
                            
                            {/* Render Media */}
                            {renderMedia(msg)}
                            
                            {/* Render Text Message */}
                            {msg.message && (
                                <div className={cx('bubble')}>{msg.message}</div>
                            )}
                            
                            <span className={cx('time')}>
                                {formatTime(msg.createdDate || msg.createdAt)}
                            </span>
                        </div>
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}

export default ChatMessages;