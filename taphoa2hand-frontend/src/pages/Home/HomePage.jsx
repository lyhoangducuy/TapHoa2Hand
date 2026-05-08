import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm cái này để chuyển trang
import classNames from 'classnames/bind';
import styles from './HomePage.module.scss';
import { getSellingPosts } from '../../services/postService';
import { getAllCategories } from '../../services/categoryService';
import BannerSlider from '../Banner/BannerSlider';

// Hàm format thời gian
const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} giờ trước`;
    } else {
        return postDate.toLocaleDateString('vi-VN');
    }
};

const HomePage = () => {
    const cx = classNames.bind(styles);
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Hook điều hướng

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoriesData = await getAllCategories();
                setCategories(categoriesData.result || categoriesData || []);

                // Fetch posts đang bán
                const postsData = await getSellingPosts(0, 10);
                console.log("API Response (selling posts):", postsData);
                if (postsData && postsData.result && Array.isArray(postsData.result.content)) {
                    setPosts(postsData.result.content);
                }
            } catch (err) {
                console.error("Giao diện HomePage lỗi khi gọi API:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Hàm xử lý khi click vào sản phẩm
    const handleProductClick = (id) => {
        // Phải khớp với: {path:'/post-detail/:postId', component:PostDetailPage}
        navigate(`/post-detail/${id}`);
    };

    // Hàm xử lý khi click vào danh mục
    const handleCategoryClick = (categoryId) => {
        navigate(`/search?categoryId=${categoryId}`);
    };

    if (loading) return <div className={cx('loading')}>Đang tải tin đăng mới nhất...</div>;

    return (
        <div className={cx('wrapper')}>
            {/* Categories Navigation */}
            {categories.length > 0 && (
                <div className={cx('categories-section')}>
                    <div className={cx('categories-scroll')}>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={cx('category-btn')}
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <BannerSlider></BannerSlider>
            <h2 className={cx('page-title')}>Tin đăng đang bán</h2>

            <div className={cx('product-grid')}>
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className={cx('product-card')}
                        onClick={() => handleProductClick(post.id)}
                    >
                        <div className={cx('image-wrapper')}>
                            {post.postImages && post.postImages.length > 0 ? (
                                <img src={post.postImages[0].imageUrl} alt={post.title} />
                            ) : (
                                <div className={cx('no-image')}>Không ảnh</div>
                            )}
                        </div>

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

                            <div className={cx('meta-info')}>
                                <span>{post.viewCount || 0} lượt xem</span>
                                <span>•</span>
                                <span>{formatTimeAgo(post.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Button */}
            <div className={cx('view-all-section')}>
                <button
                    className={cx('view-all-btn')}
                    onClick={() => navigate('/search')}
                >
                    Xem tất cả tin đăng
                </button>
            </div>
        </div>
    );
};

export default HomePage;