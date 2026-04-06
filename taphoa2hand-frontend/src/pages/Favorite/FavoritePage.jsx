import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './FavoritePage.module.scss';
import { getMyFavoritePosts, removePostFromFavorites } from '../../services/favoriteService'; // Đảm bảo đường dẫn này đúng
import { FiHeart, FiEye, FiTrash2, FiClock } from 'react-icons/fi';

const cx = classNames.bind(styles);
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image';

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
        // Cập nhật lại danh sách sau khi xóa
        setFavorites(prev => prev.filter(post => post.id !== postId));
    };
    const formatDate = (dateArray) => {
        if (!dateArray) return 'Mới đây';
        // Xử lý nếu LocalDate backend trả về dạng mảng [YYYY, MM, DD] hoặc chuỗi 'YYYY-MM-DD'
        if (Array.isArray(dateArray)) {
            return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
        }
        return new Date(dateArray).toLocaleDateString('vi-VN');
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
                <div className={cx('grid-container')}>
                    {favorites.map((post) => {
                        // Lấy ảnh thumbnail, hoặc ảnh đầu tiên trong mảng postImages, nếu không có thì dùng ảnh mặc định
                        const thumbnail = post.postImages?.find(img => img.isThumbnail)?.imageUrl
                            || post.postImages?.[0]?.imageUrl
                            || DEFAULT_IMAGE;

                        return (
                            <div key={post.id} className={cx('card')}>
                                <Link to={`/post-detail/${post.id}`} className={cx('img-wrapper')}>
                                    <img
                                        src={thumbnail}
                                        alt={post.title}
                                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                    />
                                </Link>

                                <div className={cx('info')}>
                                    <Link to={`/post-detail/${post.id}`} className={cx('post-title')}>
                                        {post.title}
                                    </Link>
                                    <div className={cx('price')}>{formatPrice(post.price)}</div>

                                    <div className={cx('meta')}>
                                        <div className={cx('stats-group')}>
                                            <span className={cx('stat-item')}>
                                                <FiEye /> {post.viewCount || 0}
                                            </span>
                                            <span className={cx('stat-item')}>
                                                <FiClock /> {formatDate(post.createdAt)}
                                            </span>
                                        </div>

                                        {/* Nút xóa tin lưu - Bạn có thể bắt sự kiện onClick gọi API xóa ở đây */}
                                        <button className={cx('btn-unlike')} title="Bỏ lưu tin" onClick={handleDeletePost.bind(null, post.id)}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
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