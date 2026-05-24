import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm cái này để chuyển trang
import classNames from 'classnames/bind';
import styles from './HomePage.module.scss';
import { getSellingPosts, getBuyingPosts } from '../../services/postService';
import { getAllCategories } from '../../services/categoryService';
import BannerSlider from '../Banner/BannerSlider';

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

const HomePage = () => {
    const cx = classNames.bind(styles);
    const [sellingPosts, setSellingPosts] = useState([]);
    const [buyingPosts, setBuyingPosts] = useState([]);
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
                const sellingData = await getSellingPosts(0, 10);
                if (sellingData && sellingData.result && Array.isArray(sellingData.result.content)) {
                    setSellingPosts(sellingData.result.content);
                }

                // Fetch posts cần mua
                try {
                    const buyingData = await getBuyingPosts(0, 10);
                    if (buyingData && buyingData.result && Array.isArray(buyingData.result.content)) {
                        setBuyingPosts(buyingData.result.content);
                    }
                } catch (e) {
                    // If buying endpoint fails, ignore so selling still shows
                    console.warn('Không lấy được tin cần mua:', e);
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
            <h2 className={cx('page-title')}>Tin đăng đang bán mới nhất</h2>

            <div className={cx('product-grid')}>
                {sellingPosts.map((post) => (
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
                            <p className={cx('post-time')}>{formatTimeAgo(post.createdAt)}</p>

                                {/* Payment methods */}
                                {post.acceptedPaymentMethods && post.acceptedPaymentMethods.length > 0 && (
                                    <div className={cx('payments')}>
                                        {post.acceptedPaymentMethods.map((pm) => (
                                            <span key={pm.name} className={cx('payment-badge')}>
                                                {pm.description || pm.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                        </div>
                    </div>
                ))}
            </div>

            <div className={cx('view-all-section')}>
                <button
                    className={cx('view-all-btn')}
                    onClick={() => navigate('/search?postType=SELL')}
                >
                    Xem tất cả tin rao bán
                </button>
            </div>

            {/* Buying posts section */}
            <section className={cx('section')}>
                <h2 className={cx('page-title')}>Tin đăng cần mua mới nhất</h2>

                <div className={cx('product-grid')}>
                    {buyingPosts.map((post) => (
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
                                        <span className={cx('type-badge', post.postType.name?.toLowerCase() || 'buy')}>
                                            {post.postType.displayName || post.postType.name || 'Tin cần mua'}
                                        </span>
                                    )}
                                    {post.status && (
                                        <span className={cx('status-badge', post.status.name?.toLowerCase() || 'available')}>
                                            {post.status.displayName || post.status.name || 'Đang tìm chủ'}
                                        </span>
                                    )}
                                </div>

                                <h3 className={cx('post-title')}>{post.title}</h3>
                                <p className={cx('price')}>
                                    {post.price?.toLocaleString('vi-VN')} đ
                                </p>
                                <p className={cx('post-time')}>{formatTimeAgo(post.createdAt)}</p>

                                    {/* Payment methods */}
                                    {post.acceptedPaymentMethods && post.acceptedPaymentMethods.length > 0 && (
                                        <div className={cx('payments')}>
                                            {post.acceptedPaymentMethods.map((pm) => (
                                                <span key={pm.name} className={cx('payment-badge')}>
                                                    {pm.description || pm.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                            </div>
                        </div>
                    ))}
                </div>

                <div className={cx('view-all-section')}>
                    <button
                        className={cx('view-all-btn')}
                        onClick={() => navigate('/search?postType=BUY')}
                    >
                        Xem tất cả tin cần mua
                    </button>
                </div>
            </section>
        </div>
    );
};

export default HomePage;