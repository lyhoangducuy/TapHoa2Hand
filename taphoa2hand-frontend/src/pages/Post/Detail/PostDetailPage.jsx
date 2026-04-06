import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PostDetailPage.module.scss';
import { 
    deletePost, 
    getPostDetail
} from '../../../services/postService';
import {
    FiMapPin, FiClock, FiEye, FiPhone, FiMessageCircle,
    FiChevronRight, FiBox, FiInfo, FiUser, FiCheckCircle, FiHome, FiCreditCard,
    FiMoreHorizontal, FiHeart
} from 'react-icons/fi';
import { addPostToFavorites, isFavoritePost, removePostFromFavorites } from '../../../services/favoriteService';

const cx = classNames.bind(styles);
const DEFAULT_IMAGE = 'https://via.placeholder.com/600x400?text=No+Image';

function PostDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [showProduct, setShowProduct] = useState(false);

    const menuRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // --- LOGIC CLICK RA NGOÀI ĐỂ ĐÓNG MENU ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- FETCH DATA & CHECK YÊU THÍCH ---
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

                    if (data.postImages && data.postImages.length > 0) {
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

        const checkFavoriteStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) return; // Chưa đăng nhập thì bỏ qua

            try {
                const response = await isFavoritePost(postId);
                if (response.code === 1000) {
                    setIsFavorite(response.result.success);
                } else if (response === true || response === false) {
                    setIsFavorite(response); 
                }
            } catch (error) {
                console.error("Lỗi kiểm tra trạng thái yêu thích:", error);
            }
        };

        fetchDetail();
        checkFavoriteStatus();
        window.scrollTo(0, 0);
    }, [postId]);

    if (loading) return <div className={cx('loading')}>Đang tải dữ liệu bài đăng...</div>;
    if (!post) return <div className={cx('error')}>Bài viết không tồn tại hoặc đã bị ẩn!</div>;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const detail = post.postDetail || {};
    const address = post.postAddress || {};
    const seller = post.user || {};
    const payments = post.acceptedPaymentMethods || [];
    const images = post.postImages || [];

    const categoryName = post.categories?.length > 0
        ? (post.categories[0].name || post.categories[0])
        : null;

    // --- PHẦN PHÂN QUYỀN & CHỨC NĂNG ---
    const currentUser = localStorage.getItem('token') || null;
    const isOwner = currentUser?.username === seller.username;
    const isAdmin = currentUser?.roles?.some(role => role.name === 'ADMIN' || role === 'ADMIN');

    const canDelete = isOwner || isAdmin;
    const canReport = currentUser && !isOwner && !isAdmin;

    const handleDeletePost = async () => {
        setShowMenu(false);
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác!")) {
            try {
                const response = await deletePost(postId);
                if (response.code === 1000) {
                    alert("Đã xóa bài viết thành công!");
                    navigate('/'); 
                } else {
                    alert("Không thể xóa: " + (response.message || "Lỗi không xác định"));
                }
            } catch (error) {
                console.error("Lỗi khi xóa bài:", error);
                alert("Đã xảy ra lỗi hệ thống khi xóa bài. Vui lòng thử lại sau!");
            }
        }
    };

    const handleReportPost = () => {
        setShowMenu(false);
        alert("Hiện popup báo cáo bài viết!");
    };

    const handleToggleFavorite = async () => {
        if (!currentUser) {
            alert("Bạn cần đăng nhập để lưu tin!");
            return;
        }

        try {
            if (isFavorite) {
                await removePostFromFavorites(postId);
                setIsFavorite(false);
            } else {
                await addPostToFavorites(postId);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Lỗi thao tác lưu tin:", error);
            alert("Không thể thực hiện thao tác. Vui lòng thử lại sau!");
        }
    };

    // --- GIAO DIỆN ---
    return (
        <div className={cx('wrapper')}>
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
                            <div className={cx('spec-row')}><span>Thương hiệu</span><strong>{detail.brand || 'Đang cập nhật'}</strong></div>
                            <div className={cx('spec-row')}><span>Dòng máy</span><strong>{detail.model || 'Đang cập nhật'}</strong></div>
                            <div className={cx('spec-row')}><span>Tình trạng</span><strong>{detail.itemCondition || 'Đang cập nhật'}</strong></div>
                            <div className={cx('spec-row')}><span>Thời gian sử dụng</span><strong>{detail.usedDuration || 'Không rõ'}</strong></div>
                            <div className={cx('spec-row')}><span>Lý do bán</span><strong>{detail.reasonForSelling || 'Không rõ'}</strong></div>
                        </div>
                    </div>
                </div>

                <div className={cx('right-column')}>
                    <div className={cx('price-card')}>
                        <div className={cx('title-action-wrapper')}>
                            <h1 className={cx('post-title')}>{post.title}</h1>

                            <div className={cx('action-buttons')}>
                                {/* Nút Lưu tin (Đã thêm logic đổi màu vàng) */}
                                <button
                                    className={cx('action-btn', 'heart-btn', { active: isFavorite })}
                                    onClick={handleToggleFavorite}
                                    title={isFavorite ? "Bỏ lưu tin" : "Lưu tin"}
                                >
                                    <FiHeart 
                                        fill={isFavorite ? "#FFC107" : "none"} 
                                        color={isFavorite ? "#FFC107" : "currentColor"} 
                                    />
                                </button>

                                {/* Dropdown 3 chấm */}
                                {(canDelete || canReport) && (
                                    <div className={cx('dropdown-container')} ref={menuRef}>
                                        <button
                                            className={cx('action-btn')}
                                            onClick={() => setShowMenu(!showMenu)}
                                        >
                                            <FiMoreHorizontal />
                                        </button>

                                        {showMenu && (
                                            <ul className={cx('dropdown-menu')}>
                                                {canDelete && (
                                                    <li className={cx('danger-item')} onClick={handleDeletePost}>
                                                        Xóa bài viết
                                                    </li>
                                                )}
                                                {canReport && (
                                                    <li onClick={handleReportPost}>
                                                        Báo cáo tin
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

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

                        {payments.length > 0 && (
                            <div className={cx('payments')}>
                                <FiCreditCard style={{ marginRight: '8px' }} />
                                <span>Thanh toán: <strong>{payments.map(p => p.label).join(' - ')}</strong></span>
                            </div>
                        )}
                    </div>

                    <div className={cx('seller-card')}>
                        <div className={cx('seller-info')}>
                            <div className={cx('avatar')}>
                                {seller.avatar ? (
                                    <img src={seller.avatar} alt="Avatar" onError={(e) => e.target.src = DEFAULT_IMAGE} />
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
                                className={cx('btn-phone', { showing: showProduct })}
                                onClick={() => setShowProduct(!showProduct)}
                            >
                                <FiPhone />
                                {showProduct ? (seller.phone || 'Chưa có SĐT') : 'Bấm để hiện số điện thoại'}
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