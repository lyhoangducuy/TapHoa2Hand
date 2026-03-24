import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './HomePage.module.scss';
import {  getAllPosts } from '../../services/postService'; // Điều chỉnh đường dẫn nếu cần

const cx = classNames.bind(styles);

function HomePage() {
    // State để lưu danh sách bài đăng
    const [posts, setPosts] = useState([]);
    // State để hiển thị trạng thái đang tải
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Gọi service lấy dữ liệu
                const data = await getAllPosts();
                
                // Kiểm tra mã code = 1000 theo chuẩn ApiResponse của Backend
                if (data && data.code === 1000) {
                    setPosts(data.result);
                }
            } catch (err) {
                console.error("Giao diện HomePage lỗi khi gọi API:", err);
            } finally {
                // Tắt trạng thái đang tải bất kể thành công hay thất bại
                setLoading(false);
            }
        };

        fetchPosts();
    }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần khi component mount

    if (loading) return <div className={cx('loading')}>Đang tải tin đăng mới nhất...</div>;

    return (
        <div className={cx('wrapper')}>
            {/* Tiêu đề trang */}
            <h2 className={cx('page-title')}>Tin đăng mới tại Huế</h2>
            
            {/* Chia lưới sản phẩm */}
            <div className={cx('product-grid')}>
                {posts.map((post) => (
                    // Card sản phẩm, dùng post.id làm key
                    <div key={post.id} className={cx('product-card')}>
                        <div className={cx('image-wrapper')}>
                            {/* Lấy ảnh đầu tiên trong mảng postImages */}
                            {post.postImages && post.postImages.length > 0 ? (
                                <img src={post.postImages[0].imageUrl} alt={post.title} />
                            ) : (
                                <div className={cx('no-image')}>Không ảnh</div>
                            )}
                            
                            {/* Trạng thái tin đăng */}
                            <span className={cx('status-badge')}>{post.status}</span>
                        </div>
                        
                        {/* Thông tin sản phẩm */}
                        <div className={cx('info-wrapper')}>
                            <h3 className={cx('post-title')}>{post.title}</h3>
                            <p className={cx('price')}>
                                {post.price?.toLocaleString('vi-VN')} đ
                            </p>
                            
                            {/* Thông tin phụ: lượt xem, ngày tạo */}
                            <div className={cx('meta-info')}>
                                <span>{post.viewCount || 0} lượt xem</span>
                                <span>•</span>
                                <span>{post.createdAt}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;