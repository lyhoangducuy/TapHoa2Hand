import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './AdminStatisticsPage.module.scss';
import { toast } from 'react-toastify';

import {
    getDashboardSummary,
    getRevenueChart,
    getOrdersStatistics,
    getUsersStatistics,
    getReportsStatistics,
    exportOrdersExcel,
    exportUsersExcel,
    exportReportsExcel,
    exportRevenueExcel
} from '../../../services/statisticsService';

import {
    FaMoneyBillWave,
    FaShoppingCart,
    FaUsers,
    FaBoxOpen,
    FaFlag,
    FaUndoAlt,
    FaHandshake,
    FaWallet,
    FaDownload,
    FaChartLine,
    FaChartBar,
    FaUserPlus,
    FaChevronLeft,
    FaChevronRight,
    FaSpinner
} from 'react-icons/fa';

const cx = classNames.bind(styles);

// Format currency
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

// Get default dates (last 30 days)
const getDefaultDates = () => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    return {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0]
    };
};

const AdminStatisticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [revenueChart, setRevenueChart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    
    const [activeTab, setActiveTab] = useState('summary');
    const [dateRange, setDateRange] = useState(getDefaultDates());
    
    // Pagination states
    const [ordersPage, setOrdersPage] = useState(0);
    const [usersPage, setUsersPage] = useState(0);
    const [reportsPage, setReportsPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState({ orders: 0, users: 0, reports: 0 });
    
    const [exporting, setExporting] = useState(false);

    // Fetch all data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, chartRes, ordersRes, usersRes, reportsRes] = await Promise.all([
                getDashboardSummary(dateRange.fromDate, dateRange.toDate),
                getRevenueChart(dateRange.fromDate, dateRange.toDate),
                getOrdersStatistics(dateRange.fromDate, dateRange.toDate, ordersPage, pageSize),
                getUsersStatistics(dateRange.fromDate, dateRange.toDate, usersPage, pageSize),
                getReportsStatistics(dateRange.fromDate, dateRange.toDate, reportsPage, pageSize)
            ]);

            setSummary(summaryRes.result);
            setRevenueChart(chartRes.result || []);
            console.log(summaryRes);
            if (ordersRes.result) {
                setOrders(ordersRes.result.content || []);
                setTotalPages(prev => ({ ...prev, orders: ordersRes.result.totalPages }));
            }
            
            if (usersRes.result) {
                setUsers(usersRes.result.content || []);
                setTotalPages(prev => ({ ...prev, users: usersRes.result.totalPages }));
            }
            
            if (reportsRes.result) {
                setReports(reportsRes.result.content || []);
                setTotalPages(prev => ({ ...prev, reports: reportsRes.result.totalPages }));
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
            toast.error('Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    }, [dateRange, ordersPage, usersPage, reportsPage, pageSize]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle date change
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
        // Reset pages when date changes
        setOrdersPage(0);
        setUsersPage(0);
        setReportsPage(0);
    };

    // Handle export
    const handleExport = async (type) => {
        setExporting(true);
        try {
            switch (type) {
                case 'orders':
                    await exportOrdersExcel(dateRange.fromDate, dateRange.toDate);
                    break;
                case 'users':
                    await exportUsersExcel(dateRange.fromDate, dateRange.toDate);
                    break;
                case 'reports':
                    await exportReportsExcel(dateRange.fromDate, dateRange.toDate);
                    break;
                case 'revenue':
                    await exportRevenueExcel(dateRange.fromDate, dateRange.toDate);
                    break;
            }
            toast.success('Xuất file Excel thành công!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Xuất file thất bại');
        } finally {
            setExporting(false);
        }
    };

    // Pagination
    const handlePageChange = (type, newPage) => {
        switch (type) {
            case 'orders':
                setOrdersPage(newPage);
                break;
            case 'users':
                setUsersPage(newPage);
                break;
            case 'reports':
                setReportsPage(newPage);
                break;
        }
    };

    // Find max revenue for chart scaling
    const maxRevenue = Math.max(...revenueChart.map(item => item.revenue || 0), 1);

    if (loading && !summary) {
        return (
            <div className={cx('loading-container')}>
                <FaSpinner className={cx('spinner')} />
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>Dashboard</h1>
                
                {/* Date Filter */}
                <div className={cx('date-filter')}>
                    <div className={cx('date-input')}>
                        <label>Từ ngày:</label>
                        <input
                            type="date"
                            name="fromDate"
                            value={dateRange.fromDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    <div className={cx('date-input')}>
                        <label>Đến ngày:</label>
                        <input
                            type="date"
                            name="toDate"
                            value={dateRange.toDate}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={cx('tabs')}>
                <button
                    className={cx('tab', { active: activeTab === 'summary' })}
                    onClick={() => setActiveTab('summary')}
                >
                    <FaChartLine /> Tổng quan
                </button>
                <button
                    className={cx('tab', { active: activeTab === 'orders' })}
                    onClick={() => setActiveTab('orders')}
                >
                    <FaShoppingCart /> Đơn hàng
                </button>
                <button
                    className={cx('tab', { active: activeTab === 'users' })}
                    onClick={() => setActiveTab('users')}
                >
                    <FaUsers /> Người dùng
                </button>
                <button
                    className={cx('tab', { active: activeTab === 'reports' })}
                    onClick={() => setActiveTab('reports')}
                >
                    <FaFlag /> Báo cáo
                </button>
            </div>

            {/* Content */}
            <div className={cx('content')}>
                {/* SUMMARY TAB */}
                {activeTab === 'summary' && (
                    <div className={cx('summary-section')}>
                        {/* Stats Cards */}
                        <div className={cx('stats-grid')}>
                            <div className={cx('stat-card', 'revenue')}>
                                <div className={cx('stat-icon')}>
                                    <FaMoneyBillWave />
                                </div>
                                <div className={cx('stat-info')}>
                                    <span className={cx('stat-label')}>Tổng doanh thu</span>
                                    <span className={cx('stat-value')}>{formatCurrency(summary?.totalRevenue)}</span>
                                </div>
                            </div>

                            <div className={cx('stat-card', 'orders')}>
                                <div className={cx('stat-icon')}>
                                    <FaShoppingCart />
                                </div>
                                <div className={cx('stat-info')}>
                                    <span className={cx('stat-label')}>Tổng đơn hàng</span>
                                    <span className={cx('stat-value')}>{summary?.totalOrders || 0}</span>
                                </div>
                            </div>

                            <div className={cx('stat-card', 'users')}>
                                <div className={cx('stat-icon')}>
                                    <FaUserPlus />
                                </div>
                                <div className={cx('stat-info')}>
                                    <span className={cx('stat-label')}>Người dùng mới</span>
                                    <span className={cx('stat-value')}>{summary?.newUsers || 0}</span>
                                </div>
                            </div>

                            <div className={cx('stat-card', 'posts')}>
                                <div className={cx('stat-icon')}>
                                    <FaBoxOpen />
                                </div>
                                <div className={cx('stat-info')}>
                                    <span className={cx('stat-label')}>Bài đăng mới</span>
                                    <span className={cx('stat-value')}>{summary?.newPosts || 0}</span>
                                </div>
                            </div>

                            <div className={cx('stat-card', 'reports')}>
                                <div className={cx('stat-icon')}>
                                    <FaFlag />
                                </div>
                                <div className={cx('stat-info')}>
                                    <span className={cx('stat-label')}>Báo cáo</span>
                                    <span className={cx('stat-value')}>{summary?.totalReports || 0}</span>
                                    {summary?.pendingReports > 0 && (
                                        <span className={cx('stat-badge')}>{summary.pendingReports} chờ</span>
                                    )}
                                </div>
                            </div>

                            <div className={cx('stat-card', 'refund')}>
                                <div className={cx('stat-icon')}>
                                    <FaUndoAlt />
                                </div>
                                <div className={cx('stat-info')}>
                                    <span className={cx('stat-label')}>Đơn hoàn tiền</span>
                                    <span className={cx('stat-value')}>{summary?.refundOrders || 0}</span>
                                </div>
                            </div>

                            <div className={cx('stat-card', 'escrow')}>
                                <div className={cx('stat-icon')}>
                                    <FaHandshake />
                                </div>
                                <div className={cx('stat-info')}>
                                    <span className={cx('stat-label')}>Giao dịch trung gian</span>
                                    <span className={cx('stat-value')}>{summary?.escrowOrders || 0}</span>
                                </div>
                            </div>

                            <div className={cx('stat-card', 'direct')}>
                                <div className={cx('stat-icon')}>
                                    <FaWallet />
                                </div>
                                <div className={cx('stat-info')}>
                                    <span className={cx('stat-label')}>Giao dịch trực tiếp</span>
                                    <span className={cx('stat-value')}>{summary?.directOrders || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Chart */}
                        <div className={cx('chart-section')}>
                            <div className={cx('chart-header')}>
                                <h3><FaChartBar /> Doanh thu theo ngày</h3>
                                <button
                                    className={cx('export-btn')}
                                    onClick={() => handleExport('revenue')}
                                    disabled={exporting}
                                >
                                    <FaDownload /> Xuất Excel
                                </button>
                            </div>
                            <div className={cx('chart-container')}>
                                {revenueChart.length > 0 ? (
                                    <div className={cx('bar-chart')}>
                                        {revenueChart.map((item, index) => (
                                            <div key={index} className={cx('bar-item')}>
                                                <div className={cx('bar-wrapper')}>
                                                    <div
                                                        className={cx('bar')}
                                                        style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                                                        title={formatCurrency(item.revenue)}
                                                    >
                                                        <span className={cx('bar-value')}>
                                                            {item.revenue > 0 ? formatCurrency(item.revenue) : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={cx('bar-label')}>{formatDate(item.date)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={cx('empty-chart')}>
                                        Không có dữ liệu doanh thu trong khoảng thời gian này
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className={cx('table-section')}>
                        <div className={cx('table-header')}>
                            <h3>Danh sách đơn hàng</h3>
                            <button
                                className={cx('export-btn')}
                                onClick={() => handleExport('orders')}
                                disabled={exporting}
                            >
                                <FaDownload /> Xuất Excel
                            </button>
                        </div>
                        <div className={cx('table-container')}>
                            <table className={cx('data-table')}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Người mua</th>
                                        <th>Người bán</th>
                                        <th>Trạng thái</th>
                                        <th>Phương thức</th>
                                        <th>Tổng tiền</th>
                                        <th>Ngày tạo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr key={order.id}>
                                                <td className={cx('cell-id')}>{order.id?.slice(0, 8)}...</td>
                                                <td>{order.buyerName}</td>
                                                <td>{order.sellerName}</td>
                                                <td>
                                                    <span className={cx('status-badge', order.status?.toLowerCase())}>
                                                        {order.statusDisplayName}
                                                    </span>
                                                </td>
                                                <td>{order.paymentMethod}</td>
                                                <td className={cx('cell-amount')}>{formatCurrency(order.totalAmount)}</td>
                                                <td>{formatDate(order.createdAt)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className={cx('empty')}>
                                                Không có đơn hàng nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={ordersPage}
                            totalPages={totalPages.orders}
                            onPageChange={(page) => handlePageChange('orders', page)}
                        />
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className={cx('table-section')}>
                        <div className={cx('table-header')}>
                            <h3>Danh sách người dùng</h3>
                            <button
                                className={cx('export-btn')}
                                onClick={() => handleExport('users')}
                                disabled={exporting}
                            >
                                <FaDownload /> Xuất Excel
                            </button>
                        </div>
                        <div className={cx('table-container')}>
                            <table className={cx('data-table')}>
                                <thead>
                                    <tr>
                                        <th>Họ tên</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Số điện thoại</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày đăng ký</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.fullName}</td>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone || '-'}</td>
                                                <td>
                                                    <span className={cx('status-badge', user.active ? 'active' : 'inactive')}>
                                                        {user.active ? 'Hoạt động' : 'Khóa'}
                                                    </span>
                                                </td>
                                                <td>{formatDate(user.createdAt)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className={cx('empty')}>
                                                Không có người dùng nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={usersPage}
                            totalPages={totalPages.users}
                            onPageChange={(page) => handlePageChange('users', page)}
                        />
                    </div>
                )}

                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                    <div className={cx('table-section')}>
                        <div className={cx('table-header')}>
                            <h3>Danh sách báo cáo</h3>
                            <button
                                className={cx('export-btn')}
                                onClick={() => handleExport('reports')}
                                disabled={exporting}
                            >
                                <FaDownload /> Xuất Excel
                            </button>
                        </div>
                        <div className={cx('table-container')}>
                            <table className={cx('data-table')}>
                                <thead>
                                    <tr>
                                        <th>Loại</th>
                                        <th>Lý do</th>
                                        <th>Người báo cáo</th>
                                        <th>Người bị báo cáo</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày tạo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.length > 0 ? (
                                        reports.map((report) => (
                                            <tr key={report.id}>
                                                <td>{report.typeDisplayName}</td>
                                                <td>{report.reasonDisplayName}</td>
                                                <td>{report.reporterName}</td>
                                                <td>{report.reportedUserName || '-'}</td>
                                                <td>
                                                    <span className={cx('status-badge', report.status?.toLowerCase())}>
                                                        {report.statusDisplayName}
                                                    </span>
                                                </td>
                                                <td>{formatDate(report.createdAt)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className={cx('empty')}>
                                                Không có báo cáo nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={reportsPage}
                            totalPages={totalPages.reports}
                            onPageChange={(page) => handlePageChange('reports', page)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className={cx('pagination')}>
            <button
                className={cx('page-btn')}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
            >
                <FaChevronLeft />
            </button>
            <span className={cx('page-info')}>
                Trang {currentPage + 1} / {totalPages}
            </span>
            <button
                className={cx('page-btn')}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
            >
                <FaChevronRight />
            </button>
        </div>
    );
};

export default AdminStatisticsPage;
