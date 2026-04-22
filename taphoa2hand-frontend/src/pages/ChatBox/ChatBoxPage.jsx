import { useState, useEffect, useRef } from "react";
import { chatWithAI } from "../../services/chatBoxService";
import styles from './ChatBoxPage.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function ChatBox() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null);
    
    const fileInputRef = useRef(null);

    // Xử lý tạo và thu hồi URL preview để tránh rò rỉ bộ nhớ
    useEffect(() => {
        if (!file) {
            setFilePreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setFilePreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    const handleSend = async () => {
        if ((!input.trim() && !file) || loading) return;

        const userMsg = {
            role: "user",
            content: input,
            file: filePreviewUrl 
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        setLoading(true);

        try {
            const res = await chatWithAI(input, file);
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: res.result 
                }
            ]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "Lỗi AI rồi 😢" }
            ]);
        }

        setLoading(false);
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <>
            <div className={cx('bubble-btn')} onClick={() => setOpen(!open)}>
                🤖
            </div>

            {open && (
                <div className={cx('chat-window')}>
                    <div className={cx('chat-header')}>
                        <span>AI Assistant 🤖</span>
                        <span style={{ cursor: 'pointer', fontSize: '14px' }} onClick={() => setOpen(false)}>
                            ❌
                        </span>
                    </div>

                    <div className={cx('chat-body')}>
                        {messages.map((m, i) => (
                            <div key={i} className={cx('message-wrapper', m.role)}>
                                <div className={cx('message-bubble', m.role)}>
                                    {m.content && <div>{m.content}</div>}
                                    {m.file && (
                                        <img src={m.file} alt="attachment" />
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className={cx('loading-text')}>
                                🤖 AI đang suy nghĩ...
                            </div>
                        )}
                    </div>

                    <div className={cx('chat-footer')}>
                        {/* Phần hiển thị Preview khi đã chọn ảnh */}
                        {file && filePreviewUrl && (
                            <div className={cx('file-preview-container')}>
                                <img src={filePreviewUrl} alt="Preview" className={cx('file-preview-image')} />
                                <div className={cx('file-info')}>
                                    <span className={cx('file-name')}>{file.name}</span>
                                    <span className={cx('file-size')}>{formatFileSize(file.size)}</span>
                                </div>
                                <button type="button" className={cx('btn-remove-file')} onClick={handleRemoveFile} title="Xóa ảnh">
                                    ❌
                                </button>
                            </div>
                        )}

                        {/* Thanh nhập liệu gom vào 1 hàng ngang */}
                        <div className={cx('input-row')}>
                            {/* Nút đính kèm ảnh (Label đóng vai trò làm nút giả) */}
                            <label className={cx('btn-attach', { disabled: loading })} title="Đính kèm ảnh">
                                🖼️
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setFile(e.target.files[0])}
                                    className={cx('hidden-file-input')}
                                    disabled={loading}
                                    ref={fileInputRef}
                                />
                            </label>

                            {/* Ô nhập text */}
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập tin nhắn..."
                                className={cx('input-text')}
                                disabled={loading}
                                autoFocus
                            />

                            {/* Nút Gửi */}
                            <button 
                                onClick={handleSend} 
                                className={cx('btn-send')}
                                disabled={loading || (!input.trim() && !file)}
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}