import React from 'react';
import classNames from 'classnames/bind';
import { FiMessageCircle } from 'react-icons/fi';
import styles from '../ChatPage.module.scss';

const cx = classNames.bind(styles);

function ChatWindow({ 
    activeChatId, 
    currentChat, 
    children 
}) {
    if (!activeChatId) {
        return (
            <div className={cx('chat-area')}>
                <div className={cx('no-chat-selected')}>
                    <div className={cx('icon-wrapper')}>
                        <FiMessageCircle size={48} color="#0084ff" />
                    </div>
                    <h3>Chào mừng đến với TapHoa2Hand Chat</h3>
                    <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin hoặc tìm kiếm ở thanh bên trái.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('chat-area')}>
            {children}
        </div>
    );
}

export default ChatWindow;