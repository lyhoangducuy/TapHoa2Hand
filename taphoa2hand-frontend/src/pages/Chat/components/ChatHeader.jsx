import React from 'react';
import classNames from 'classnames/bind';
import { FiMoreVertical, FiTag } from 'react-icons/fi';
import styles from '../ChatPage.module.scss';

const cx = classNames.bind(styles);

const formatPrice = (price) => {
    if (!price && price !== 0) return 'Thỏa thuận';
    const num = Number(price);
    if (isNaN(num)) return price;
    return num.toLocaleString('vi-VN') + ' đ';
};

const getProductImageUrl = (postImage) => {
    if (!postImage) return 'https://via.placeholder.com/50';
    if (Array.isArray(postImage) && postImage.length > 0) return postImage[0]?.url || postImage[0];
    if (typeof postImage === 'string') return postImage;
    return 'https://via.placeholder.com/50';
};

function ChatHeader({ currentChat, onOpenOrderModal }) {
    return (
        <div className={cx('chat-header')}>
            <div className={cx('user-info')}>
                <div className={cx('avatar')}>
                    {currentChat?.avatar ? (
                        <img src={currentChat.avatar} alt="avatar" />
                    ) : (
                        currentChat?.name?.charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <div className={cx('name')}>{currentChat?.name}</div>
                    <div className={cx('status')}>Đang hoạt động</div>
                </div>
            </div>
            <div className={cx('actions')}>
                <button><FiMoreVertical size={20} /></button>
            </div>
        </div>
    );
}

function PinnedProduct({ currentChat, onOpenOrderModal }) {
    if (!currentChat?.postId) return null;

    return (
        <div className={cx('pinned-product')}>
            <div className={cx('product-image')}>
                <img src={getProductImageUrl(currentChat.postImage)} alt="Product" />
            </div>
            <div className={cx('product-info')}>
                <span className={cx('title')}>
                    <FiTag size={16} />
                    <span>{currentChat.postTitle || 'Sản phẩm đang trao đổi'}</span>
                </span>
                <span className={cx('price')}>{formatPrice(currentChat.postPrice)}</span>
                <span className={cx('id')}>ID: {currentChat.postId}</span>
            </div>
            <div className={cx('product-actions')}>
                {!currentChat.isMyPost && (
                    <button 
                        className={cx('btn-primary')} 
                        onClick={onOpenOrderModal}
                    >
                        Yêu cầu giao dịch
                    </button>
                )}
                <button className={cx('btn-secondary')}>Xem bài</button>
            </div>
        </div>
    );
}

export { ChatHeader, PinnedProduct };