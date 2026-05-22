import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './MyReportsPage.module.scss';
import { getMyReportsPaged } from '../../../services/reportService';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const STATUS_CONFIG = {
    PENDING: { label: 'Chờ xử lý', bg: '#fff9e6', color: '#b45309', dot: '#f59e0b' },
    APPROVED: { label: 'Đã duyệt', bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
    PROCESSED: { label: 'Đã xử lý', bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
    REJECTED: { label: 'Bị từ chối', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
};

const TYPE_CONFIG = {
    USER: { label: 'Người dùng', icon: '👤' },
    POST: { label: 'Bài đăng', icon: '📝' },
    ORDER: { label: 'Đơn hàng', icon: '📦' },
};

const MyReportsPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const size = 10;

    const fetchReports = async (pageNum = 0) => {
        try {
            setLoading(true);
            const res = await getMyReportsPaged({ page: pageNum, size });
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

    useEffect(() => {
        fetchReports();
    }, []);

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
                    <button className={cx('back-btn')} onClick={() => navigate(-1)}>← Quay lại</button>
                    <div>
                        <h1 className={cx('page-title')}>Lịch sử báo cáo</h1>
                        <p className={cx('page-subtitle')}>Theo dõi trạng thái các báo cáo bạn đã gửi</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={cx('content')}>
                {loading ? (
                    <div className={cx('loading-state')}>
                        <div className={cx('spinner')} />
                        <span>Đang tải danh sách báo cáo...</span>
                    </div>
                ) : reports.length === 0 ? (
                    <div className={cx('empty-state')}>
                        <div className={cx('empty-icon')}>📋</div>
                        <h3>Chưa có báo cáo nào</h3>
                        <p>Bạn chưa gửi bất kỳ báo cáo nào. Nếu phát hiện vi phạm, hãy báo cáo ngay!</p>
                    </div>
                ) : (
                    <>
                        <div className={cx('result-count')}>
                            Tổng cộng <strong>{totalElements}</strong> báo cáo
                        </div>

                        <div className={cx('report-list')}>
                            {reports.map((report) => {
                                const status = getStatus(report);
                                const type = getType(report);
                                const sc = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
                                const tc = TYPE_CONFIG[type] || TYPE_CONFIG.USER;

                                return (
                                    <div key={report.id} className={cx('report-card')}>
                                        {/* Card header */}
                                        <div className={cx('card-header')}>
                                            <div className={cx('card-meta')}>
                                                <span className={cx('type-badge')}>
                                                    {tc.icon} {tc.label}
                                                </span>
                                                <span
                                                    className={cx('status-badge')}
                                                    style={{ background: sc.bg, color: sc.color }}
                                                >
                                                    <span className={cx('status-dot')} style={{ background: sc.dot }} />
                                                    {sc.label}
                                                </span>
                                            </div>
                                            <span className={cx('report-id')}>ID: {report.id?.slice(0, 8)}...</span>
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
