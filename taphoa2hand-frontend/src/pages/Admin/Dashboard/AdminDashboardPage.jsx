import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './AdminDashboardPage.module.scss';
import { toast } from 'react-toastify';

import {
    getDashboardOverview,
    getRevenueByMonth,
    getOrderStatusDistribution,
    getPostsByCategory,
    getReportReasonsDistribution,
    getTopSellers,
    getTopReportedUsers,
    getRatingDistribution,
    getAiAssessmentDistribution,
    getRecentActivities
} from '../../../services/dashboardService';

import {
    FaUsers,
    FaBoxOpen,
    FaShoppingCart,
    FaFlag,
    FaMoneyBillWave,
    FaChartLine,
    FaChartBar,
    FaStar,
    FaRobot,
    FaClock,
    FaArrowUp,
    FaSpinner,
    FaExclamationTriangle
} from 'react-icons/fa';

const cx = classNames.bind(styles);

// Format currency
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0đ';
    if (amount >= 1000000) {
        return new Intl.NumberFormat('vi-VN', {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(amount) + 'đ';
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
};

// Format number
const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
};

// Format time ago
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

// Get month name
const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return monthNames[parseInt(month) - 1] + '/' + year.slice(2);
};

const AdminDashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [postsByCategory, setPostsByCategory] = useState([]);
    const [reportReasons, setReportReasons] = useState([]);
    const [topSellers, setTopSellers] = useState([]);
    const [topReportedUsers, setTopReportedUsers] = useState([]);
    const [ratingDistribution, setRatingDistribution] = useState([]);
    const [aiAssessment, setAiAssessment] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [
                overviewRes,
                revenueRes,
                orderStatusRes,
                postsRes,
                reportReasonsRes,
                topSellersRes,
                topReportedRes,
                ratingRes,
                aiRes,
                activitiesRes
            ] = await Promise.all([
                getDashboardOverview(),
                getRevenueByMonth(2026),
                getOrderStatusDistribution(),
                getPostsByCategory(),
                getReportReasonsDistribution(),
                getTopSellers(5),
                getTopReportedUsers(5),
                getRatingDistribution(),
                getAiAssessmentDistribution(),
                getRecentActivities(10)
            ]);

            setOverview(overviewRes.result);
            setRevenueByMonth(revenueRes.result || []);
            setOrderStatus(orderStatusRes.result || []);
            setPostsByCategory(postsRes.result || []);
            setReportReasons(reportReasonsRes.result || []);
            setTopSellers(topSellersRes.result || []);
            setTopReportedUsers(topReportedRes.result || []);
            setRatingDistribution(ratingRes.result || []);
            setAiAssessment(aiRes.result || []);
            setRecentActivities(activitiesRes.result || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    const maxRevenue = Math.max(...revenueByMonth.map(item => item?.revenue || 0), 1);
    const maxCategoryCount = Math.max(...postsByCategory.map(item => item?.count || 0), 1);
    const maxReportCount = Math.max(...reportReasons.map(item => item?.count || 0), 1);

    if (loading) {
        return (
            <div className={cx('loading-container')}>
                <FaSpinner className={cx('spinner')} />
                <p>Đang tải dashboard...</p>
            </div>
        );
    }

    return (
        <div className={cx('dashboard')}>
            <h1 className={cx('page-title')}>Dashboard Quản trị</h1>

            {/* ========== SECTION 1: Overview Cards ========== */}
            <section className={cx('section')}>
                <h2 className={cx('section-title')}>
                    <FaChartLine /> Tổng quan hệ thống
                </h2>
                <div className={cx('overview-grid')}>
                    <div className={cx('stat-card', 'users')}>
                        <div className={cx('stat-icon')}><FaUsers /></div>
                        <div className={cx('stat-content')}>
                            <span className={cx('stat-value')}>{formatNumber(overview?.totalUsers)}</span>
                            <span className={cx('stat-label')}>Tổng người dùng</span>
                            <span className={cx('stat-trend', 'up')}>
                                <FaArrowUp /> +{formatNumber(overview?.newUsersThisMonth)} tháng này
                            </span>
                        </div>
                    </div>

                    <div className={cx('stat-card', 'posts')}>
                        <div className={cx('stat-icon')}><FaBoxOpen /></div>
                        <div className={cx('stat-content')}>
                            <span className={cx('stat-value')}>{formatNumber(overview?.totalPosts)}</span>
                            <span className={cx('stat-label')}>Tổng bài đăng</span>
                            <span className={cx('stat-sub')}>{formatNumber(overview?.activePosts)} đang hoạt động</span>
                        </div>
                    </div>

                    <div className={cx('stat-card', 'orders')}>
                        <div className={cx('stat-icon')}><FaShoppingCart /></div>
                        <div className={cx('stat-content')}>
                            <span className={cx('stat-value')}>{formatNumber(overview?.totalOrders)}</span>
                            <span className={cx('stat-label')}>Tổng đơn hàng</span>
                            <span className={cx('stat-trend', 'up')}>
                                <FaArrowUp /> +{formatNumber(overview?.newOrdersThisMonth)} tháng này
                            </span>
                        </div>
                    </div>

                    <div className={cx('stat-card', 'revenue')}>
                        <div className={cx('stat-icon')}><FaMoneyBillWave /></div>
                        <div className={cx('stat-content')}>
                            <span className={cx('stat-value')}>{formatCurrency(overview?.revenueThisMonth)}</span>
                            <span className={cx('stat-label')}>Doanh thu tháng này</span>
                            <span className={cx('stat-sub')}>Phí nền tảng</span>
                        </div>
                    </div>

                    <div className={cx('stat-card', 'reports')}>
                        <div className={cx('stat-icon')}><FaFlag /></div>
                        <div className={cx('stat-content')}>
                            <span className={cx('stat-value')}>{formatNumber(overview?.totalReports)}</span>
                            <span className={cx('stat-label')}>Tổng báo cáo</span>
                            {overview?.pendingReports > 0 && (
                                <span className={cx('stat-badge', 'warning')}>
                                    <FaExclamationTriangle /> {overview.pendingReports} chưa xử lý
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== SECTION 2: Revenue & Order Status ========== */}
            <section className={cx('section')}>
                <h2 className={cx('section-title')}>
                    <FaChartLine /> Thống kê giao dịch
                </h2>
                <div className={cx('charts-row')}>
                    <div className={cx('chart-card', 'large')}>
                        <h3>Doanh thu theo tháng (2026)</h3>
                        <div className={cx('bar-chart')}>
                            {revenueByMonth.map((item, index) => (
                                <div key={index} className={cx('bar-item')}>
                                    <div className={cx('bar-wrapper')}>
                                        <div
                                            className={cx('bar', 'revenue')}
                                            style={{ height: `${(item?.revenue / maxRevenue) * 100}%` }}
                                            title={formatCurrency(item?.revenue)}
                                        >
                                            <span className={cx('bar-value')}>
                                                {item?.revenue > 0 ? formatCurrency(item?.revenue) : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={cx('bar-label')}>{getMonthName(item?.date)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cx('chart-card')}>
                        <h3>Trạng thái đơn hàng</h3>
                        <div className={cx('pie-chart')}>
                            {orderStatus.slice(0, 5).map((item, index) => {
                                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                                return (
                                    <div key={index} className={cx('pie-item')}>
                                        <div className={cx('pie-color')} style={{ background: colors[index % colors.length] }} />
                                        <span className={cx('pie-label')}>{item?.statusDisplayName}</span>
                                        <span className={cx('pie-value')}>{formatNumber(item?.count)} ({item?.percentage}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== SECTION 3: Posts & Reports ========== */}
            <section className={cx('section')}>
                <h2 className={cx('section-title')}>
                    <FaChartBar /> Thống kê nội dung
                </h2>
                <div className={cx('charts-row')}>
                    <div className={cx('chart-card', 'large')}>
                        <h3>Bài đăng theo danh mục</h3>
                        <div className={cx('horizontal-bar-chart')}>
                            {postsByCategory.slice(0, 8).map((item, index) => (
                                <div key={index} className={cx('h-bar-item')}>
                                    <span className={cx('h-bar-label')}>{item?.categoryName}</span>
                                    <div className={cx('h-bar-wrapper')}>
                                        <div
                                            className={cx('h-bar')}
                                            style={{ width: `${(item?.count / maxCategoryCount) * 100}%` }}
                                        />
                                    </div>
                                    <span className={cx('h-bar-value')}>{formatNumber(item?.count)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cx('chart-card')}>
                        <h3>Lý do báo cáo</h3>
                        <div className={cx('bar-chart', 'vertical')}>
                            {reportReasons.slice(0, 6).map((item, index) => (
                                <div key={index} className={cx('v-bar-item')}>
                                    <div className={cx('v-bar-wrapper')}>
                                        <div
                                            className={cx('v-bar', 'warning')}
                                            style={{ height: `${(item?.count / maxReportCount) * 100}%` }}
                                        >
                                            <span className={cx('v-bar-value')}>{formatNumber(item?.count)}</span>
                                        </div>
                                    </div>
                                    <span className={cx('v-bar-label')}>{item?.reasonDisplayName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== SECTION 4: Users ========== */}
            <section className={cx('section')}>
                <h2 className={cx('section-title')}>
                    <FaUsers /> Thống kê người dùng
                </h2>
                <div className={cx('tables-row')}>
                    <div className={cx('table-card')}>
                        <h3>Top người bán nhiều đơn nhất</h3>
                        <table className={cx('data-table')}>
                            <thead>
                                <tr>
                                    <th>Người dùng</th>
                                    <th>Tổng đơn</th>
                                    <th>Hoàn thành</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSellers.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className={cx('user-cell')}>
                                                <div className={cx('user-avatar')}>
                                                    {item?.fullName?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span>{item?.fullName}</span>
                                            </div>
                                        </td>
                                        <td className={cx('text-center')}>{formatNumber(item?.totalOrders)}</td>
                                        <td className={cx('text-success')}>{formatNumber(item?.completedOrders)}</td>
                                    </tr>
                                ))}
                                {topSellers.length === 0 && (
                                    <tr><td colSpan="3" className={cx('empty')}>Không có dữ liệu</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={cx('table-card')}>
                        <h3>Người dùng bị báo cáo nhiều nhất</h3>
                        <table className={cx('data-table')}>
                            <thead>
                                <tr>
                                    <th>Người dùng</th>
                                    <th>Số báo cáo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topReportedUsers.map((item, index) => (
                                    <tr key={index} className={cx('warning-row')}>
                                        <td>
                                            <div className={cx('user-cell')}>
                                                <div className={cx('user-avatar', 'warning')}>
                                                    {item?.fullName?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span>{item?.fullName}</span>
                                            </div>
                                        </td>
                                        <td className={cx('text-danger')}>{formatNumber(item?.totalReports)}</td>
                                    </tr>
                                ))}
                                {topReportedUsers.length === 0 && (
                                    <tr><td colSpan="2" className={cx('empty')}>Không có dữ liệu</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ========== SECTION 5: Ratings & AI ========== */}
            <section className={cx('section')}>
                <h2 className={cx('section-title')}>
                    <FaStar /> Đánh giá & AI
                </h2>
                <div className={cx('charts-row')}>
                    <div className={cx('chart-card')}>
                        <h3><FaStar /> Phân bố đánh giá</h3>
                        <div className={cx('rating-chart')}>
                            {ratingDistribution.map((item, index) => (
                                <div key={index} className={cx('rating-item')}>
                                    <div className={cx('stars')}>
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={cx(i < item?.rating ? 'star-filled' : 'star-empty')} />
                                        ))}
                                    </div>
                                    <div className={cx('rating-bar-wrapper')}>
                                        <div
                                            className={cx('rating-bar')}
                                            style={{ width: `${item?.percentage}%` }}
                                        />
                                    </div>
                                    <span className={cx('rating-percent')}>{item?.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cx('chart-card')}>
                        <h3><FaRobot /> Kiểm định AI</h3>
                        <div className={cx('ai-chart')}>
                            {aiAssessment.map((item, index) => (
                                <div key={index} className={cx('ai-item', item?.assessment === 'NORMAL' ? 'normal' : 'suspicious')}>
                                    <span className={cx('ai-label')}>{item?.displayName}</span>
                                    <div className={cx('ai-bar-wrapper')}>
                                        <div
                                            className={cx('ai-bar')}
                                            style={{ width: `${item?.percentage}%` }}
                                        />
                                    </div>
                                    <span className={cx('ai-value')}>{formatNumber(item?.count)} ({item?.percentage}%)</span>
                                </div>
                            ))}
                            {aiAssessment.length === 0 && (
                                <p className={cx('empty-text')}>Chưa có dữ liệu kiểm định AI</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== SECTION 6: Recent Activities ========== */}
            <section className={cx('section')}>
                <h2 className={cx('section-title')}>
                    <FaClock /> Hoạt động gần đây
                </h2>
                <div className={cx('activities-list')}>
                    {recentActivities.map((activity, index) => (
                        <div key={index} className={cx('activity-item')}>
                            <div className={cx('activity-icon', activity?.type?.toLowerCase())}>
                                {activity?.type === 'ORDER' && <FaShoppingCart />}
                                {activity?.type === 'POST' && <FaBoxOpen />}
                                {activity?.type === 'REPORT' && <FaFlag />}
                            </div>
                            <div className={cx('activity-content')}>
                                <span className={cx('activity-desc')}>{activity?.description}</span>
                                <span className={cx('activity-time')}>{formatTimeAgo(activity?.time)}</span>
                            </div>
                        </div>
                    ))}
                    {recentActivities.length === 0 && (
                        <p className={cx('empty-text')}>Không có hoạt động gần đây</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboardPage;
