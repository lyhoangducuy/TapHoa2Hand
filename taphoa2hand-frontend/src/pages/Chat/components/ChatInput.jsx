import React, { useRef } from 'react';
import classNames from 'classnames/bind';
import { FiImage, FiVideo, FiSend, FiX } from 'react-icons/fi';
import styles from '../ChatPage.module.scss';

const cx = classNames.bind(styles);

function ChatInput({ 
    messageInput, 
    setMessageInput, 
    isSending, 
    onSendMessage,
    selectedFile,
    setSelectedFile,
    onFileSelect
}) {
    const fileInputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelect(file);
        }
        e.target.value = '';
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const isVideo = selectedFile && selectedFile.type.startsWith('video/');

    return (
        <div className={cx('chat-input')}>
            {/* File Preview */}
            {selectedFile && (
                <div className={cx('file-preview')}>
                    {isVideo ? (
                        <video src={URL.createObjectURL(selectedFile)} className={cx('preview-video')} controls />
                    ) : (
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className={cx('preview-image')} />
                    )}
                    <button type="button" className={cx('remove-file-btn')} onClick={handleRemoveFile}>
                        <FiX />
                    </button>
                    <span className={cx('file-name')}>{selectedFile.name}</span>
                </div>
            )}

            <div className={cx('input-row')}>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*,video/*" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }}
                />
                
                <button 
                    type="button" 
                    className={cx('action-btn')} 
                    onClick={() => fileInputRef.current?.click()}
                    title="Gửi ảnh/video"
                >
                    {isVideo ? <FiVideo size={20} /> : <FiImage size={20} />}
                </button>

                <input 
                    type="text" 
                    placeholder={selectedFile ? 'Thêm chú thích...' : 'Nhập tin nhắn...'} 
                    value={messageInput} 
                    onChange={(e) => setMessageInput(e.target.value)} 
                    disabled={isSending} 
                    onKeyDown={handleKeyDown}
                />
                
                <button 
                    className={cx('send-btn', { active: messageInput.trim().length > 0 || selectedFile })} 
                    onClick={onSendMessage} 
                    disabled={isSending || (!messageInput.trim() && !selectedFile)}
                >
                    <FiSend size={20} />
                </button>
            </div>
        </div>
    );
}

export default ChatInput;