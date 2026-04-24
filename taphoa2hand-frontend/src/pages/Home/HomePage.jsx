import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm cái này để chuyển trang
import classNames from 'classnames/bind';
import styles from './HomePage.module.scss';
import { getAllPosts } from '../../services/postService';

const cx = classNames.bind(styles);

function HomePage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Hook điều hướng

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getAllPosts();
                if (data && data.code === 1000) {
                    setPosts(data.result);
                }
            } catch (err) {
                console.error("Giao diện HomePage lỗi khi gọi API:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Hàm xử lý khi click vào sản phẩm
    const handleProductClick = (id) => {
        // Phải khớp với: {path:'/post-detail/:postId', component:PostDetailPage}
        navigate(`/post-detail/${id}`);
    };

    if (loading) return <div className={cx('loading')}>Đang tải tin đăng mới nhất...</div>;

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('page-title')}>Tin đăng mới nhất </h2>

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

                            <span className={cx('type-badge', post.postType?.name?.toLowerCase())}>
                                {post.postType?.displayName || post.postType?.name}
                            </span>
                            <span className={cx('status-badge', post.status?.toLowerCase())}>
                                {post.status}
                            </span>
                        </div>

                        <div className={cx('info-wrapper')}>
                            <h3 className={cx('post-title')}>{post.title}</h3>
                            <p className={cx('price')}>
                                {post.price?.toLocaleString('vi-VN')} đ
                            </p>

                            <div className={cx('meta-info')}>
                                <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;