import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PostDetailPage.module.scss';
import { getPostDetail } from '../../../services/postService'; // Đảm bảo đường dẫn đúng
import { 
    FiMapPin, FiClock, FiEye, FiPhone, FiMessageCircle, 
    FiChevronRight, FiBox, FiInfo, FiUser, FiCheckCircle, FiHome, FiCreditCard 
} from 'react-icons/fi';

const cx = classNames.bind(styles);
const DEFAULT_IMAGE = 'https://via.placeholder.com/600x400?text=No+Image';

function PostDetailPage() {
    const { postId } = useParams(); 
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!postId || postId === 'undefined') {
                setLoading(false);
                return;
            }

            try {
                const response = await getPostDetail(postId);
                if (response.code === 1000) {
                    const data = response.result;
                    setPost(data);
                    
                    // Xử lý lấy ảnh chính (Dựa vào postImages là mảng Object)
                    if (data.postImages && data.postImages.length > 0) {
                        // Ưu tiên ảnh thumbnail, nếu không có thì lấy ảnh đầu tiên
                        const thumbnail = data.postImages.find(img => img.isThumbnail);
                        setActiveImage(thumbnail ? thumbnail.imageUrl : data.postImages[0].imageUrl);
                    }
                }
            } catch (error) {
                console.error("Lỗi fetch chi tiết bài đăng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
        window.scrollTo(0, 0);
    }, [postId]);

    if (loading) return <div className={cx('loading')}>Đang tải dữ liệu bài đăng...</div>;
    if (!post) return <div className={cx('error')}>Bài viết không tồn tại hoặc đã bị ẩn!</div>;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Bóc tách dữ liệu từ JSON lồng nhau cho code gọn gàng
    const detail = post.postDetail || {};
    const address = post.postAddress || {};
    const seller = post.user || {};
    const payments = post.acceptedPaymentMethods || [];
    const images = post.postImages || [];
    
    // Giả định categories là mảng chuỗi hoặc đối tượng (an toàn)
    const categoryName = post.categories?.length > 0 
        ? (post.categories[0].name || post.categories[0]) 
        : null;

    return (
        <div className={cx('wrapper')}>
            {/* --- BREADCRUMB --- */}
            <nav className={cx('breadcrumb')}>
                <Link to="/" className={cx('breadcrumb-item')}>
                    <FiHome /> Trang chủ
                </Link>
                <FiChevronRight className={cx('separator')} />
                {categoryName && (
                    <>
                        <Link to={`/search?category=${categoryName}`} className={cx('breadcrumb-item')}>
                            {categoryName}
                        </Link>
                        <FiChevronRight className={cx('separator')} />
                    </>
                )}
                <span className={cx('breadcrumb-item', 'active')}>{post.title}</span>
            </nav>

            <div className={cx('container')}>
                {/* --- CỘT TRÁI: HÌNH ẢNH & CHI TIẾT --- */}
                <div className={cx('left-column')}>
                    <div className={cx('image-section')}>
                        <div className={cx('main-img-box')}>
                            <img 
                                src={activeImage || DEFAULT_IMAGE} 
                                alt="Main" 
                                onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                            />
                            <span className={cx('status-tag', post.status?.toLowerCase())}>
                                {post.status === 'AVAILABLE' ? 'Đang bán' : post.status}
                            </span>
                        </div>
                        <div className={cx('thumb-row')}>
                            {images.map((img) => (
                                <img 
                                    key={img.id}
                                    src={img.imageUrl}
                                    className={cx({ active: activeImage === img.imageUrl })}
                                    onClick={() => setActiveImage(img.imageUrl)}
                                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                    alt="Thumbnail"
                                />
                            ))}
                        </div>
                    </div>

                    <div className={cx('info-block')}>
                        <h3><FiInfo /> Mô tả sản phẩm</h3>
                        <p className={cx('desc')}>{detail.description || 'Người bán chưa cung cấp mô tả chi tiết.'}</p>
                    </div>

                    <div className={cx('info-block')}>
                        <h3><FiBox /> Thông số chi tiết</h3>
                        <div className={cx('spec-list')}>
                            <div className={cx('spec-row')}>
                                <span>Thương hiệu</span>
                                <strong>{detail.brand || 'Đang cập nhật'}</strong>
                            </div>
                            <div className={cx('spec-row')}>
                                <span>Dòng máy</span>
                                <strong>{detail.model || 'Đang cập nhật'}</strong>
                            </div>
                            <div className={cx('spec-row')}>
                                <span>Tình trạng</span>
                                <strong>{detail.itemCondition || 'Đang cập nhật'}</strong>
                            </div>
                            <div className={cx('spec-row')}>
                                <span>Thời gian sử dụng</span>
                                <strong>{detail.usedDuration || 'Không rõ'}</strong>
                            </div>
                            <div className={cx('spec-row')}>
                                <span>Lý do bán</span>
                                <strong>{detail.reasonForSelling || 'Không rõ'}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: GIÁ & THÔNG TIN NGƯỜI BÁN --- */}
                <div className={cx('right-column')}>
                    <div className={cx('price-card')}>
                        <h1 className={cx('post-title')}>{post.title}</h1>
                        <div className={cx('price-tag')}>{formatPrice(post.price)}</div>
                        
                        <div className={cx('meta')}>
                            <span><FiClock /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span><FiEye /> {post.viewCount || 0} lượt xem</span>
                        </div>

                        <div className={cx('location')}>
                            <FiMapPin /> 
                            <span>
                                {address.street ? `${address.street}, ` : ''}
                                {address.ward ? `${address.ward}, ` : ''}
                                {address.city || 'Chưa cập nhật địa chỉ'}
                            </span>
                        </div>

                        {/* Thêm phần hiển thị phương thức thanh toán */}
                        {payments.length > 0 && (
                            <div className={cx('payments')}>
                                <FiCreditCard style={{marginRight: '8px'}}/> 
                                <span>Thanh toán: <strong>{payments.map(p => p.label).join(' - ')}</strong></span>
                            </div>
                        )}
                    </div>

                    <div className={cx('seller-card')}>
                        <div className={cx('seller-info')}>
                            <div className={cx('avatar')}>
                                {seller.avatar ? (
                                    <img 
                                        src={seller.avatar} 
                                        alt="Avatar" 
                                        onError={(e) => e.target.src = DEFAULT_IMAGE} 
                                    />
                                ) : (
                                    <FiUser />
                                )}
                            </div>
                            <div className={cx('name-box')}>
                                <strong>{seller.fullName || 'Người dùng TapHoa2Hand'}</strong>
                                <span className={cx('verify')}>
                                    <FiCheckCircle /> Đối tác tin cậy
                                </span>
                            </div>
                        </div>
                        
                        <div className={cx('btns')}>
                            <button 
                                className={cx('btn-phone', { showing: showPhone })} 
                                onClick={() => setShowPhone(!showPhone)}
                            >
                                <FiPhone /> 
                                {showPhone ? (seller.phone || 'Chưa có SĐT') : 'Bấm để hiện số điện thoại'}
                            </button>
                            <button className={cx('btn-chat')}>
                                <FiMessageCircle /> Chat với người bán
                            </button>
                        </div>
                    </div>

                    <div className={cx('safety-tips')}>
                        <strong>Mẹo mua sắm an toàn</strong>
                        <ul>
                            <li>Nên giao dịch trực tiếp để kiểm tra hàng.</li>
                            <li>Không chuyển khoản đặt cọc trước.</li>
                            <li>Kiểm tra kỹ thông số kỹ thuật sản phẩm.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostDetailPage;