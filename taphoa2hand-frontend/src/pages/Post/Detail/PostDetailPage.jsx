import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PostDetailPage.module.scss';
import { FiChevronRight, FiBox, FiInfo, FiHome } from 'react-icons/fi';

import { getPostDetail } from '../../../services/postService';
import { isFavoritePost } from '../../../services/favoriteService';

// Import các component con
import ImageGallery from './components/ImageGallery';
import AiAssessment from './components/AiAssessment';
import SidebarRight from './components/SidebarRight';

const cx = classNames.bind(styles);

function PostDetailPage() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const token = localStorage.getItem('token');
    const currentUser = token ? JSON.parse(atob(token.split('.')[1])) : null;

    const fetchInitialData = async () => {
    if (!postId || postId === 'undefined') {
        setLoading(false);
        return;
    }

    try {
        setLoading(true);

        const [detailRes, favRes] = await Promise.all([
            getPostDetail(postId),
            token ? isFavoritePost(postId) : Promise.resolve(false)
        ]);

        if (detailRes.code === 1000) {
            setPost(detailRes.result);
        }

        if (favRes && typeof favRes === 'object' && favRes.code === 1000) {
            setIsFavorite(favRes.result.success);
        } else if (typeof favRes === 'boolean') {
            setIsFavorite(favRes);
        }

    } catch (error) {
        console.error("Lỗi fetch dữ liệu:", error);
    } finally {
        setLoading(false);
    }
};
useEffect(() => {
    fetchInitialData();
    window.scrollTo(0, 0);
}, [postId, token]);

    if (loading) return <div className={cx('loading')}>Đang tải dữ liệu bài đăng...</div>;
    if (!post) return <div className={cx('error')}>Bài viết không tồn tại hoặc đã bị ẩn!</div>;

    const detail = post.postDetail || {};
    const address = post.postAddress || {};
    const seller = post.user || {};
    const categoryName = post.categories?.length > 0 ? (post.categories[0].name || post.categories[0]) : null;

    return (
        <div className={cx('wrapper')}>
            <nav className={cx('breadcrumb')}>
                <Link to="/" className={cx('breadcrumb-item')}><FiHome /> Trang chủ</Link>
                <FiChevronRight className={cx('separator')} />
                {categoryName && (
                    <>
                        <Link to={`/search?category=${categoryName}`} className={cx('breadcrumb-item')}>{categoryName}</Link>
                        <FiChevronRight className={cx('separator')} />
                    </>
                )}
                <span className={cx('breadcrumb-item', 'active')}>{post.title}</span>
            </nav>

            <div className={cx('container')}>
                <div className={cx('left-column')}>
                    
                    {/* Ảnh sản phẩm */}
                    <ImageGallery images={post.postImages || []} status={post.status} postType={post.postType} />

                    

                    {/* Mô tả */}
                    <div className={cx('info-block')}>
                        <h3><FiInfo /> Mô tả sản phẩm</h3>
                        <p className={cx('desc')}>{detail.description || 'Người bán chưa cung cấp mô tả chi tiết.'}</p>
                    </div>

                    {/* Thông số */}
                    <div className={cx('info-block')}>
                        <h3><FiBox /> Thông số chi tiết</h3>
                        <div className={cx('spec-list')}>
                            <div className={cx('spec-row')}><span>Thương hiệu</span><strong>{detail.brand || 'Đang cập nhật'}</strong></div>
                            <div className={cx('spec-row')}><span>Dòng máy</span><strong>{detail.model || 'Đang cập nhật'}</strong></div>
                            <div className={cx('spec-row')}><span>Tình trạng</span><strong>{detail.itemCondition || 'Đang cập nhật'}</strong></div>
                            <div className={cx('spec-row')}><span>Thời gian sử dụng</span><strong>{detail.usedDuration || 'Không rõ'}</strong></div>
                            <div className={cx('spec-row')}><span>Lý do bán</span><strong>{detail.reasonForSelling || 'Không rõ'}</strong></div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Bên Phải */}
                <SidebarRight 
                    post={post} 
                    seller={seller} 
                    address={address}
                    isFavorite={isFavorite}
                    setIsFavorite={setIsFavorite}
                    currentUser={currentUser}
                    postId={postId}
                    onReportSuccess={() => {
                        fetchInitialData(); // Tải lại dữ liệu bài đăng để cập nhật số lượng báo cáo
                }}
                />
                
            </div>
        </div>
    );
}

export default PostDetailPage;