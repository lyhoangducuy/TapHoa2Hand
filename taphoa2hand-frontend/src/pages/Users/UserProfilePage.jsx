import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../Profile/ProfilePage.module.scss';
import { getUserById } from '../../services/userService';
import { getUserPosts } from '../../services/postService';
import { getToken } from '../../services/localStorageService';
import UserPosts from '../Profile/Post/UserPosts';
import ReportModal from '../../components/Report/ReportModal';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiLoader, FiShield, FiFlag } from 'react-icons/fi';
import { getUserAverageRating, getUserFeedbacksWithOrderPost } from '../../services/feedbackService';
import { getCompletedOrderCount } from '../../services/orderService';
import UserRatingCard from '../../components/Feedback/UserRatingCard';
import FeedbackList from '../../components/Feedback/FeedbackList';
const cx = classNames.bind(styles);

function UserProfilePage() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);

    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [completedAsBuyer, setCompletedAsBuyer] = useState(0);
    const [completedAsSeller, setCompletedAsSeller] = useState(0);

    // Reviews tab
    const [profileTab, setProfileTab] = useState('posts');
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, postsResponse] = await Promise.all([
                    getUserById(userId).catch(() => null),
                    getUserPosts(userId, 0, 10).catch(() => null)
                ]);

                if (userResponse?.data?.code === 1000) {
                    setUser(userResponse.data.result);
                }

                if (postsResponse?.code === 1000 && postsResponse.result) {
                    setPosts(postsResponse.result.content || []);
                    setTotalPages(postsResponse.result.totalPages || 1);
                    setCurrentPage(0);
                }
            } catch (error) {
                console.error('Lỗi khi tải trang người dùng:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    useEffect(() => {
        const fetchRating = async () => {
            const res = await getUserAverageRating(userId);
            if (res?.code === 1000) {
                setAvgRating(res.result?.avgRating ?? 0);
                setTotalReviews(res.result?.totalReviews ?? 0);
            }
        };

        const fetchCompleted = async () => {
            try {
                const [buyerRes, sellerRes] = await Promise.all([
                    getCompletedOrderCount(userId, true).catch(() => null),
                    getCompletedOrderCount(userId, false).catch(() => null),
                ]);

                if (buyerRes?.data?.code === 1000) {
                    setCompletedAsBuyer(buyerRes.data.result ?? 0);
                }

                if (sellerRes?.data?.code === 1000) {
                    setCompletedAsSeller(sellerRes.data.result ?? 0);
                }

            } catch (err) {
                console.error('Lỗi fetch completed orders:', err);
            }
        };

        fetchRating();
        fetchCompleted();
    }, [userId]);

    const fetchFeedbacks = async () => {
        setFeedbackLoading(true);
        try {
            const res = await getUserFeedbacksWithOrderPost(userId);
            if (res && res.length !== undefined) {
                setFeedbacks(Array.isArray(res) ? res : []);
            } else if (res?.code === 1000) {
                setFeedbacks(Array.isArray(res.result) ? res.result : []);
            } else {
                setFeedbacks([]);
            }
        } catch (err) {
            console.error('Lỗi fetch feedbacks:', err);
            setFeedbacks([]);
        } finally {
            setFeedbackLoading(false);
        }
    };

    useEffect(() => {
        if (profileTab === 'reviews') {
            fetchFeedbacks();
        }
    }, [profileTab, userId]);

    const token = getToken();
    let me = null;
    if (token) {
        try {
            me = JSON.parse(atob(token.split('.')[1]));
        } catch {
            me = null;
        }
    }
    const isOwnProfile =
        me &&
        user &&
        (me.sub === user.username ||
            me.username === user.username ||
            me.id === user.id ||
            me.userId === user.id);

    const handleLoadMorePosts = async () => {
        const nextPage = currentPage + 1;
        if (nextPage >= totalPages) return;
        try {
            const response = await getUserPosts(userId, nextPage, 10);
            if (response?.code === 1000 && response.result) {
                setPosts(prev => [...prev, ...(response.result.content || [])]);
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.error('Lỗi khi tải thêm bài viết:', error);
        }
    };

    if (loading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('loading')}>
                    <FiLoader className={cx('spin')} /> Đang tải...
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('profile-card')}>
                    <h2>Người dùng không tồn tại</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('profile-card')}>
                <div className={cx('header-section')}>
                    <div className={cx('avatar-container')}>
                        <img src={user.avatar || 'https://via.placeholder.com/150'} alt="Avatar" className={cx('avatar')} />
                    </div>

                    <div className={cx('basic-info')}>
                        <div className={cx('label-group')}>
                            <span className={cx('profile-badge')}>Hồ sơ người dùng</span>
                        </div>
                        <h2 className={cx('full-name')}>{user.fullName || 'Người dùng'}</h2>
                        <p className={cx('username')}>@{user.username}</p>

                        <div className={cx('role-tags')}>
                            {user.roles?.map((role, index) => (
                                <span key={index} className={cx('role-badge')}><FiShield /> {role.name}</span>
                            ))}
                        </div>

                        <div className={cx('stats-row')}>
                            <div className={cx('stat-item')}>
                                <strong>{posts.length}{currentPage < totalPages - 1 ? '+' : ''}</strong>
                                <span>Bài đăng</span>
                            </div>
                            <div className={cx('stat-item')}>
                                <strong>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</strong>
                                <span>Đánh giá</span>
                            </div>
                            <div className={cx('stat-item')}>
                                <strong>{completedAsBuyer}</strong>
                                <span>Đã mua</span>
                            </div>
                            <div className={cx('stat-item')}>
                                <strong>{completedAsSeller}</strong>
                                <span>Đã bán</span>
                            </div>
                        </div>

                        {token && !isOwnProfile ? (
                            <div className={cx('reportProfileRow')}>
                                <button
                                    type="button"
                                    className={cx('reportUserBtn')}
                                    onClick={() => setReportOpen(true)}
                                >
                                    <FiFlag size={18} />
                                    Báo cáo hồ sơ
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>

                <hr className={cx('divider')} />

                <div className={cx('details-section')}>
                    <h3 className={cx('section-title')}>Thông tin liên hệ</h3>
                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}><FiMail /></div>
                        <div className={cx('detail-content')}><span className={cx('detail-label')}>Email</span><span className={cx('detail-value')}>{user.email || 'Chưa cập nhật'}</span></div>
                    </div>
                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}><FiPhone /></div>
                        <div className={cx('detail-content')}><span className={cx('detail-label')}>Số điện thoại</span><span className={cx('detail-value')}>{user.phone || user.phoneNumber || 'Chưa cập nhật'}</span></div>
                    </div>
                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}><FiMapPin /></div>
                        <div className={cx('detail-content')}><span className={cx('detail-label')}>Địa chỉ</span><span className={cx('detail-value')}>{user.address || 'Chưa cập nhật'}</span></div>
                    </div>
                    <div className={cx('detail-row')}>
                        <div className={cx('detail-icon-wrapper')}><FiCalendar /></div>
                        <div className={cx('detail-content')}>
                            <span className={cx('detail-label')}>Ngày tham gia</span>
                            <span className={cx('detail-value')}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}</span>
                        </div>
                    </div>
                </div>

                <hr className={cx('divider')} />

                {/* PROFILE TABS */}
                <div className={cx('profile-tabs')}>
                    <button
                        className={cx('profile-tab', { active: profileTab === 'posts' })}
                        onClick={() => setProfileTab('posts')}
                    >
                        Bài đăng ({posts.length})
                    </button>
                    <button
                        className={cx('profile-tab', { active: profileTab === 'reviews' })}
                        onClick={() => setProfileTab('reviews')}
                    >
                        Đánh giá ({totalReviews})
                    </button>
                </div>

                {profileTab === 'posts' ? (
                    <div className={cx('my-posts-section')}>
                        <UserPosts
                            posts={posts}
                            onLoadMore={handleLoadMorePosts}
                            hasMore={currentPage < totalPages - 1}
                        />
                    </div>
                ) : (
                    <div className={cx('reviews-section')}>
                        {feedbackLoading ? (
                            <div className={cx('loading')}>
                                <FiLoader className={cx('spin')} /> Đang tải đánh giá...
                            </div>
                        ) : (
                            <FeedbackList feedbacks={feedbacks} />
                        )}
                    </div>
                )}
            </div>

            <ReportModal
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                variant="user"
                targetId={user?.id}
                subtitle={`@${user?.username || ''}`}
            />
        </div>
    );
}

export default UserProfilePage;
