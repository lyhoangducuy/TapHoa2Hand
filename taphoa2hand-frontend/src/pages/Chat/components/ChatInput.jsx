import React from 'react';
import classNames from 'classnames/bind';
import { FiPaperclip, FiImage, FiSend } from 'react-icons/fi';
import styles from '../ChatPage.module.scss';

const cx = classNames.bind(styles);

function ChatInput({ 
    messageInput, 
    setMessageInput, 
    isSending, 
    onSendMessage 
}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    return (
        <div className={cx('chat-input')}>
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
                disabled={isSending} 
                onKeyDown={handleKeyDown}
            />
            <button 
                className={cx('send-btn', { active: messageInput.trim().length > 0 })} 
                onClick={onSendMessage} 
                disabled={isSending || !messageInput.trim()}
            >
                <FiSend size={20} />
            </button>
        </div>
    );
}

export default ChatInput;