import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './MyReportsPage.module.scss';
import { getMyReportsPaged } from '../../../services/reportService';
import { toast } from 'react-toastify';
import {
    FiAlertTriangle, FiUser, FiFileText, FiPackage,
    FiClock, FiCheckCircle, FiXCircle, FiFilter
} from 'react-icons/fi';

const cx = classNames.bind(styles);

const STATUS_CONFIG = {
    PENDING: { label: 'Chờ xử lý', bg: '#fff9e6', color: '#b45309', dot: '#f59e0b', icon: FiClock },
    APPROVED: { label: 'Đã duyệt', bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', icon: FiCheckCircle },
    PROCESSED: { label: 'Đã xử lý', bg: '#f0fdf4', color: '#166534', dot: '#22c55e', icon: FiCheckCircle },
    REJECTED: { label: 'Bị từ chối', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444', icon: FiXCircle },
};

const TYPE_CONFIG = {
    USER: { label: 'Người dùng', icon: FiUser, color: '#7c3aed' },
    POST: { label: 'Bài đăng', icon: FiFileText, color: '#2563eb' },
    ORDER: { label: 'Đơn hàng', icon: FiPackage, color: '#059669' },
};

const STATUS_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'PROCESSED', label: 'Đã xử lý' },
    { value: 'REJECTED', label: 'Bị từ chối' },
];

const MyReportsPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const size = 10;

    // Thống kê
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        processed: 0,
        rejected: 0,
    });

    const fetchReports = async (pageNum = 0, status = statusFilter) => {
        try {
            setLoading(true);
            const res = await getMyReportsPaged({ page: pageNum, size, status });
            if (res) {
                setReports(Array.isArray(res.content) ? res.content : []);
                setTotalPages(res.totalPages || 0);
                setTotalElements(res.totalElements || 0);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Lỗi khi tải báo cáo:', error);
            toast.error('Không tải được danh sách báo cáo');
        } finally {
            setLoading(false);
        }
    };

    // Tính stats từ reports hiện tại
    const calculateStats = (reportsList) => {
        const newStats = { pending: 0, approved: 0, processed: 0, rejected: 0 };
        reportsList.forEach(report => {
            const status = report?.status?.name;
            if (status === 'PENDING') newStats.pending++;
            else if (status === 'APPROVED') newStats.approved++;
            else if (status === 'PROCESSED') newStats.processed++;
            else if (status === 'REJECTED') newStats.rejected++;
        });
        setStats(newStats);
    };

    useEffect(() => {
        fetchReports(0);
    }, []);

    useEffect(() => {
        if (reports.length > 0) {
            calculateStats(reports);
        }
    }, [reports]);

    const handleFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        fetchReports(0, newStatus);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchReports(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatus = (report) => report?.status?.name || 'PENDING';
    const getType = (report) => report?.type?.name || 'USER';
    const getReason = (report) => report?.reason?.displayName || report?.reason?.name || '—';
    const getTarget = (report) => {
        if (report.postTitle) return report.postTitle;
        if (report.reportedUserName) return report.reportedUserName;
        if (report.orderId) return `#${report.orderId}`;
        return '—';
    };

    return (
        <div className={cx('page')}>
            {/* Header */}
            <div className={cx('page-header')}>
                <div className={cx('header-content')}>
                    <button className={cx('back-btn')} onClick={() => navigate(-1)}>
                        ← Quay lại
                    </button>
                    <div>
                        <h1 className={cx('page-title')}>Lịch sử báo cáo</h1>
                        <p className={cx('page-subtitle')}>Theo dõi trạng thái các báo cáo bạn đã gửi</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={cx('content')}>
                {/* Stats Cards */}
                <div className={cx('stats-grid')}>
                    <div className={cx('stat-card')} onClick={() => handleFilterChange('PENDING')}>
                        <div className={cx('stat-icon')} style={{ background: STATUS_CONFIG.PENDING.bg, color: STATUS_CONFIG.PENDING.color }}>
                            <FiClock size={20} />
                        </div>
                        <div className={cx('stat-info')}>
                            <span className={cx('stat-value')}>{stats.pending}</span>
                            <span className={cx('stat-label')}>Chờ xử lý</span>
                        </div>
                    </div>
                    <div className={cx('stat-card')} onClick={() => handleFilterChange('APPROVED')}>
                        <div className={cx('stat-icon')} style={{ background: STATUS_CONFIG.APPROVED.bg, color: STATUS_CONFIG.APPROVED.color }}>
                            <FiCheckCircle size={20} />
                        </div>
                        <div className={cx('stat-info')}>
                            <span className={cx('stat-value')}>{stats.approved}</span>
                            <span className={cx('stat-label')}>Đã duyệt</span>
                        </div>
                    </div>
                    <div className={cx('stat-card')} onClick={() => handleFilterChange('PROCESSED')}>
                        <div className={cx('stat-icon')} style={{ background: STATUS_CONFIG.PROCESSED.bg, color: STATUS_CONFIG.PROCESSED.color }}>
                            <FiCheckCircle size={20} />
                        </div>
                        <div className={cx('stat-info')}>
                            <span className={cx('stat-value')}>{stats.processed}</span>
                            <span className={cx('stat-label')}>Đã xử lý</span>
                        </div>
                    </div>
                    <div className={cx('stat-card')} onClick={() => handleFilterChange('REJECTED')}>
                        <div className={cx('stat-icon')} style={{ background: STATUS_CONFIG.REJECTED.bg, color: STATUS_CONFIG.REJECTED.color }}>
                            <FiXCircle size={20} />
                        </div>
                        <div className={cx('stat-info')}>
                            <span className={cx('stat-value')}>{stats.rejected}</span>
                            <span className={cx('stat-label')}>Bị từ chối</span>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className={cx('filter-bar')}>
                    <FiFilter size={16} />
                    <span>Lọc:</span>
                    <div className={cx('filter-buttons')}>
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                className={cx('filter-btn', { active: statusFilter === opt.value })}
                                onClick={() => handleFilterChange(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className={cx('loading-state')}>
                        <div className={cx('spinner')} />
                        <span>Đang tải danh sách báo cáo...</span>
                    </div>
                ) : reports.length === 0 ? (
                    <div className={cx('empty-state')}>
                        <div className={cx('empty-icon')}><FiAlertTriangle size={48} /></div>
                        <h3>Không có báo cáo nào</h3>
                        <p>
                            {statusFilter
                                ? `Không có báo cáo nào với trạng thái "${STATUS_CONFIG[statusFilter]?.label || statusFilter}"`
                                : 'Bạn chưa gửi bất kỳ báo cáo nào. Nếu phát hiện vi phạm, hãy báo cáo ngay!'
                            }
                        </p>
                        {statusFilter && (
                            <button className={cx('reset-filter-btn')} onClick={() => handleFilterChange('')}>
                                Xem tất cả báo cáo
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={cx('result-count')}>
                            {statusFilter ? (
                                <>Có <strong>{totalElements}</strong> báo cáo với trạng thái "<strong>{STATUS_CONFIG[statusFilter]?.label}</strong>"</>
                            ) : (
                                <>Tổng cộng <strong>{totalElements}</strong> báo cáo</>
                            )}
                        </div>

                        <div className={cx('report-list')}>
                            {reports.map((report) => {
                                const status = getStatus(report);
                                const type = getType(report);
                                const sc = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
                                const tc = TYPE_CONFIG[type] || TYPE_CONFIG.USER;
                                const StatusIcon = sc.icon || FiClock;
                                const TypeIcon = tc.icon || FiUser;

                                return (
                                    <div key={report.id} className={cx('report-card')}>
                                        {/* Card header */}
                                        <div className={cx('card-header')}>
                                            <div className={cx('card-meta')}>
                                                <span
                                                    className={cx('type-badge')}
                                                    style={{ background: tc.color + '15', color: tc.color }}
                                                >
                                                    <TypeIcon size={12} /> {tc.label}
                                                </span>
                                                <span
                                                    className={cx('status-badge')}
                                                    style={{ background: sc.bg, color: sc.color }}
                                                >
                                                    <StatusIcon size={12} />
                                                    {sc.label}
                                                </span>
                                            </div>
                                            <span className={cx('report-id')}>{report.id?.slice(0, 8)}...</span>
                                        </div>

                                        {/* Card body */}
                                        <div className={cx('card-body')}>
                                            <div className={cx('reason-row')}>
                                                <span className={cx('label')}>Lý do:</span>
                                                <span className={cx('reason')}>{getReason(report)}</span>
                                            </div>
                                            <div className={cx('detail-row')}>
                                                <span className={cx('label')}>Chi tiết:</span>
                                                <p className={cx('detail-text')}>{report.detail}</p>
                                            </div>
                                            <div className={cx('target-row')}>
                                                <span className={cx('label')}>Đối tượng:</span>
                                                <span className={cx('target')}>{getTarget(report)}</span>
                                            </div>
                                            {report.evidences?.length > 0 && (
                                                <div className={cx('evidence-row')}>
                                                    <span className={cx('label')}>Ảnh minh chứng:</span>
                                                    <div className={cx('evidence-thumbs')}>
                                                        {report.evidences.slice(0, 5).map((ev, i) => (
                                                            <a key={i} href={ev.imageUrl} target="_blank" rel="noreferrer">
                                                                <img src={ev.imageUrl} alt={`Minh chứng ${i + 1}`} />
                                                            </a>
                                                        ))}
                                                        {report.evidences.length > 5 && (
                                                            <span className={cx('more-ev')}>+{report.evidences.length - 5}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {report.resolutionNote && (
                                                <div className={cx('resolution-row')}>
                                                    <span className={cx('label')}>Kết quả xử lý:</span>
                                                    <p className={cx('resolution-text')}>{report.resolutionNote}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card footer */}
                                        <div className={cx('card-footer')}>
                                            <span className={cx('created-at')}>
                                                Gửi lúc: {formatDate(report.createdAt)}
                                            </span>
                                            {report.reviewedByName && (
                                                <span className={cx('reviewed-by')}>
                                                    Xử lý bởi: {report.reviewedByName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={cx('pagination')}>
                                <button
                                    className={cx('page-btn')}
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 0}
                                >
                                    ← Trước
                                </button>
                                <div className={cx('page-info')}>
                                    Trang <strong>{page + 1}</strong> / <strong>{totalPages}</strong>
                                </div>
                                <button
                                    className={cx('page-btn')}
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages - 1}
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyReportsPage;
