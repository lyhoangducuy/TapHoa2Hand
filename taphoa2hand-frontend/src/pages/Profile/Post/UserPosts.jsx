import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../ProfilePage.module.scss'; // Chú ý trỏ đúng file CSS của bạn

const cx = classNames.bind(styles);

function UserPosts({ posts, onLoadMore, hasMore }) {
    const navigate = useNavigate();

    // Hàm xử lý khi click vào card bài viết
    const handleProductClick = (postId) => {
        // Sửa lại '/post/' thành route chi tiết bài viết tương ứng trong app của bạn
        navigate(`/post-detail/${postId}`); 
    };

    if (!posts || posts.length === 0) {
        return <div className={cx('no-posts')}>Bạn chưa có bài đăng nào.</div>;
    }

    return (
        <div className={cx('user-posts-container')}>
            <div className={cx('product-grid')}>
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className={cx('product-card')}
                        onClick={() => handleProductClick(post.id)} // Bắt sự kiện click ở đây
                    >
                        <div className={cx('image-wrapper')}>
                            {post.postImages && post.postImages.length > 0 ? (
                                <img src={post.postImages[0].imageUrl} alt={post.title} />
                            ) : (
                                <div className={cx('no-image')}>Không ảnh</div>
                            )}

                            {/* Badge trạng thái (nếu có) */}
                            {post.status && (
                                <span className={cx('status-badge', post.status?.toLowerCase())}>
                                    {post.status}
                                </span>
                            )}
                        </div>

                        <div className={cx('info-wrapper')}>
                            <h3 className={cx('post-title')}>{post.title}</h3>
                            <p className={cx('price')}>
                                {post.price ? post.price.toLocaleString('vi-VN') + ' đ' : 'Thỏa thuận'}
                            </p>

                            <div className={cx('meta-info')}>
                                <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Nút xem thêm bài viết (Load more) */}
            {hasMore && (
                <div className={cx('load-more-wrapper')}>
                    <button className={cx('load-more-btn')} onClick={onLoadMore}>
                        Xem thêm
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserPosts;