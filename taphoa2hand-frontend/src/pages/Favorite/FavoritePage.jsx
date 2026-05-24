import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './FavoritePage.module.scss';
import { getMyFavoritePosts, removePostFromFavorites } from '../../services/favoriteService';
import { FiHeart, FiEye, FiTrash2, FiClock } from 'react-icons/fi';

const cx = classNames.bind(styles);
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image';

// Hàm format thời gian
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';

    const now = new Date();
    const postDate = new Date(dateString);

    if (isNaN(postDate.getTime())) return '';

    const diffInMs = now - postDate;
    const diffInSeconds = diffInMs / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;

    if (diffInSeconds < 60) {
        return `${Math.floor(diffInSeconds)} giây trước`;
    } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)} phút trước`;
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} giờ trước`;
    } else {
        return postDate.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

function FavoritePage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await getMyFavoritePosts();
                // Vì API Backend trả về ApiResponse có chứa field 'result'
                // getMyFavoritePosts trả về response.data, tức là nguyên cục ApiResponse
                const data = response?.result || [];
                setFavorites(data);
            } catch (error) {
                console.error("Lỗi tải tin lưu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };
    const handleDeletePost = async (postId) => {
        await removePostFromFavorites(postId);
        setFavorites(prev => prev.filter(post => post.id !== postId));
    };

    if (loading) {
        return <div className={cx('loading')}>Đang tải danh sách tin đã lưu...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}><FiHeart className={cx('icon-heart')} /> Tin đã lưu</h1>
                <span className={cx('count')}>({favorites.length} tin)</span>
            </div>

            {favorites.length === 0 ? (
                <div className={cx('empty-state')}>
                    <FiHeart className={cx('empty-icon')} />
                    <p>Bạn chưa lưu tin nào.</p>
                    <Link to="/" className={cx('btn-home')}>Khám phá ngay</Link>
                </div>
            ) : (
                <div className={cx('product-grid')}>
                    {favorites.map((post) => {
                        const thumbnail = post.postImages?.find(img => img.isThumbnail)?.imageUrl
                            || post.postImages?.[0]?.imageUrl
                            || DEFAULT_IMAGE;

                        return (
                            <div key={post.id} className={cx('product-card')}>
                                <Link to={`/post-detail/${post.id}`} className={cx('image-wrapper')}>
                                    <img
                                        src={thumbnail}
                                        alt={post.title}
                                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                    />
                                </Link>

                                <div className={cx('info-wrapper')}>
                                    <div className={cx('badges')}>
                                        {post.postType && (
                                            <span className={cx('type-badge', post.postType.name?.toLowerCase() || 'sell')}>
                                                {post.postType.displayName || post.postType.name || 'Tin rao bán'}
                                            </span>
                                        )}
                                        {post.status && (
                                            <span className={cx('status-badge', post.status.name?.toLowerCase() || 'available')}>
                                                {post.status.displayName || post.status.name || 'Đang bán'}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className={cx('post-title')}>{post.title}</h3>
                                    <p className={cx('price')}>
                                        {post.price?.toLocaleString('vi-VN')} đ
                                    </p>
                                    <p className={cx('post-time')}>{formatTimeAgo(post.createdAt)}</p>

                                    {post.acceptedPaymentMethods && post.acceptedPaymentMethods.length > 0 && (
                                        <div className={cx('payments')}>
                                            {post.acceptedPaymentMethods.map((pm) => (
                                                <span key={pm.name} className={cx('payment-badge')}>
                                                    {pm.description || pm.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <button className={cx('btn-unlike')} title="Bỏ lưu tin" onClick={() => handleDeletePost(post.id)}>
                                        <FiTrash2 /> Bỏ lưu
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default FavoritePage;