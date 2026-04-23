import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../PostDetailPage.module.scss';
import { 
    FiMoreHorizontal, FiHeart, FiClock, FiEye, FiMapPin, 
    FiCreditCard, FiUser, FiCheckCircle, FiPhone, FiMessageCircle 
} from 'react-icons/fi';
import { deletePost } from '../../../../services/postService';
import { addPostToFavorites, removePostFromFavorites } from '../../../../services/favoriteService';
import { createConversation } from '../../../../services/chatService';
import AiAssessment from './AiAssessment';

const cx = classNames.bind(styles);

const SidebarRight = ({ post, seller, address, isFavorite, setIsFavorite, currentUser, postId }) => {
    const navigate = useNavigate();
    const [showProduct, setShowProduct] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const menuRef = useRef(null);

    const isOwner = currentUser?.sub === seller.username || currentUser?.username === seller.username;
    const isAdmin = currentUser?.scope?.includes('ROLE_ADMIN') || false; 
    const payments = post.acceptedPaymentMethods || [];

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    useEffect(() => {
        const handleClickOutside = (e) => { 
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); 
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const handleChatWithSeller = async () => {
        if (!currentUser) {
            alert("Bạn cần đăng nhập để chat với người bán!");
            return;
        }
        try {
            setIsCreatingChat(true);
            const conversationData = {
                type: "PRIVATE",
                participantIds: [seller.id],
                postId: postId
            };
            const response = await createConversation(conversationData);
            if (response && response.result) {
                navigate(`/chat?activeId=${response.result.id}&postId=${postId}`); 
            } else {
                alert("Không thể tạo cuộc trò chuyện.");
            }
        } catch (error) {
            console.error("Lỗi khi tạo cuộc trò chuyện:", error);
            alert("Đã xảy ra lỗi hệ thống khi kết nối.");
        } finally {
            setIsCreatingChat(false);
        }
    };

    const handleDeletePost = async () => {
        setShowMenu(false);
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            try {
                const response = await deletePost(postId);
                if (response.code === 1000) {
                    alert("Đã xóa bài viết thành công!");
                    navigate('/'); 
                } else {
                    alert("Không thể xóa: " + (response.message || "Lỗi không xác định"));
                }
            } catch (error) {
                alert("Đã xảy ra lỗi hệ thống khi xóa bài.");
            }
        }
    };

    return (
        <div className={cx('right-column')}>
            <div className={cx('price-card')}>
                <div className={cx('title-action-wrapper')}>
                    <h1 className={cx('post-title')}>{post.title}</h1>
                    <div className={cx('action-buttons')}>
                        <button className={cx('action-btn', 'heart-btn', { active: isFavorite })} onClick={handleToggleFavorite} title={isFavorite ? "Bỏ lưu tin" : "Lưu tin"}>
                            <FiHeart fill={isFavorite ? "#FFC107" : "none"} color={isFavorite ? "#FFC107" : "currentColor"} />
                        </button>
                        
                        {(isOwner || isAdmin || (currentUser && !isOwner && !isAdmin)) && (
                            <div className={cx('dropdown-container')} ref={menuRef}>
                                <button className={cx('action-btn')} onClick={() => setShowMenu(!showMenu)}>
                                    <FiMoreHorizontal />
                                </button>
                                {showMenu && (
                                    <ul className={cx('dropdown-menu')}>
                                        {(isOwner || isAdmin) && <li onClick={() => navigate(`/edit-post/${postId}`)}>Chỉnh sửa bài</li>}
                                        {(isOwner || isAdmin) && <li className={cx('danger-item')} onClick={handleDeletePost}>Xóa bài</li>}
                                        {(!isOwner && !isAdmin && currentUser) && <li onClick={() => { setShowMenu(false); alert("Hiện popup báo cáo bài viết!"); }}>Báo cáo tin</li>}
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
                    <span>{[address?.street, address?.ward, address?.city].filter(Boolean).join(', ') || 'Chưa cập nhật'}</span>
                </div>
                
                {payments && payments.length > 0 && (
                    <div className={cx('payments')}>
                        <FiCreditCard style={{ marginRight: '8px' }} />
                        <span>Thanh toán: <strong>{payments.map(p => p.label).join(' - ')}</strong></span>
                    </div>
                )}
            </div>

            <div className={cx('seller-card')}>
                <div className={cx('seller-info')}>
                    <div className={cx('avatar')}>
                        {seller?.avatar ? <img src={seller.avatar} alt="Avatar" /> : <FiUser />}
                    </div>
                    <div className={cx('name-box')}>
                        <strong>{seller?.fullName || 'Người dùng TapHoa2Hand'}</strong>
                        <span className={cx('verify')}><FiCheckCircle /> Đối tác tin cậy</span>
                    </div>
                </div>

                <div className={cx('btns')}>
                    <button className={cx('btn-phone', { showing: showProduct })} onClick={() => setShowProduct(!showProduct)}>
                        <FiPhone /> {showProduct ? (seller?.phone || 'Chưa có SĐT') : 'Bấm để hiện số điện thoại'}
                    </button>
                    <button 
                        className={cx('btn-chat')} 
                        onClick={handleChatWithSeller} 
                        disabled={isCreatingChat}
                        style={{ opacity: isCreatingChat ? 0.7 : 1, cursor: isCreatingChat ? 'not-allowed' : 'pointer' }}
                    >
                        <FiMessageCircle /> {isCreatingChat ? 'Đang kết nối...' : 'Chat với người bán'}
                    </button>
                </div>
            </div>
            {/* Check AI */}<br/>
                    <AiAssessment postId={postId} />
        </div>
    );
};

export default SidebarRight;