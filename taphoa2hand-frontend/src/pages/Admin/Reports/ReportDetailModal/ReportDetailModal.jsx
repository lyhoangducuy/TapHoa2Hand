import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ReportDetailModal.module.scss';
import { reviewReport } from '../../../../services/reportAdminService';
import { toast } from 'react-toastify';
import {
    FiAlertTriangle, FiTrash2, FiEyeOff, FiLock, FiKey,
    FiSlash, FiXCircle, FiDollarSign, FiCheck, FiX,
    FiUser, FiFileText, FiPackage, FiCheckCircle,
} from 'react-icons/fi';

const cx = classNames.bind(styles);

const ALL_PENALTIES = [
    { value: 'WARNING', label: 'Cảnh cáo', icon: FiAlertTriangle, desc: 'Gửi cảnh báo đến tài khoản' },
    { value: 'REMOVE_POST', label: 'Gỡ bài đăng', icon: FiTrash2, desc: 'Xóa bài đăng bị vi phạm' },
    { value: 'HIDE_POST', label: 'Ẩn bài đăng', icon: FiEyeOff, desc: 'Ẩn bài đăng khỏi kết quả tìm kiếm' },
    { value: 'FREEZE_ACCOUNT_24H', label: 'Khóa 24 giờ', icon: FiLock, desc: 'Tạm khóa tài khoản 1 ngày' },
    { value: 'FREEZE_ACCOUNT_7D', label: 'Khóa 7 ngày', icon: FiKey, desc: 'Tạm khóa tài khoản 1 tuần' },
    { value: 'FREEZE_ACCOUNT_30D', label: 'Khóa 30 ngày', icon: FiKey, desc: 'Tạm khóa tài khoản 1 tháng' },
    { value: 'PERMANENT_BAN', label: 'Khóa vĩnh viễn', icon: FiSlash, desc: 'Cấm vĩnh viễn khỏi nền tảng' },
    { value: 'STOP_ALL_TRANSACTIONS', label: 'Dừng giao dịch', icon: FiXCircle, desc: 'Ngăn tài khoản thực hiện giao dịch' },
    { value: 'REFUND_BUYER', label: 'Hoàn tiền người mua', icon: FiDollarSign, desc: 'Hoàn tiền cho người mua' },
    { value: 'REFUND_REPORTER', label: 'Hoàn tiền người tố', icon: FiDollarSign, desc: 'Hoàn tiền cho người tố cáo' },
];

const STATUS_CONFIG = {
    PENDING: { label: 'Chờ xử lý', bg: '#fff9e6', color: '#b45309', dot: '#f59e0b' },
    APPROVED: { label: 'Đã duyệt', bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
    PROCESSED: { label: 'Đã xử lý', bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
    REJECTED: { label: 'Bị từ chối', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
};

const TYPE_CONFIG = {
    USER: 'Báo cáo người dùng',
    POST: 'Báo cáo bài đăng',
    ORDER: 'Báo cáo đơn hàng',
};

const TYPE_ICON = {
    USER: FiUser,
    POST: FiFileText,
    ORDER: FiPackage,
};

const ReportDetailModal = ({ report, isOpen, onClose, onStatusUpdate }) => {
    const [activeTab, setActiveTab] = useState('detail');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPenalties, setSelectedPenalties] = useState([]);
    const [resolutionNote, setResolutionNote] = useState('');
    const [confirmModal, setConfirmModal] = useState(false);
    const [confirmModalStatus, setConfirmModalStatus] = useState('');

    useEffect(() => {
        if (report) {
            setResolutionNote(report.resolutionNote || '');
            setSelectedPenalties(
                (report.penalties || []).map(p => p.action)
            );
        }
        setActiveTab('detail');
        setConfirmModal(false);
    }, [report]);

    if (!isOpen || !report) return null;

    const currentStatus = report.status?.name || 'PENDING';
    const sc = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;

    const togglePenalty = (value) => {
        setSelectedPenalties(prev =>
            prev.includes(value)
                ? prev.filter(p => p !== value)
                : [...prev, value]
        );
    };

    const handleReview = async (targetStatus) => {
        setConfirmModal(true);
        setConfirmModalStatus(targetStatus);
    };

    const handleConfirmSubmit = async () => {
        setConfirmModal(false);
        try {
            setIsLoading(true);
            await reviewReport(report.id, {
                status: confirmModalStatus,
                resolutionNote: resolutionNote.trim(),
                penalties: selectedPenalties
            });
            toast.success('Review báo cáo thành công!');
            onStatusUpdate?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Review thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    const getTypeLabel = (type) => TYPE_CONFIG[type] || type;

    return (
        <div className={cx('modal')} onClick={onClose}>
            <div className={cx('modalContent')} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={cx('header')}>
                    <div className={cx('header-left')}>
                        <h2>Chi tiết báo cáo</h2>
                        <div className={cx('header-meta')}>
                            <span className={cx('report-id')}>{report.id?.slice(0, 12)}...</span>
                            <span className={cx('type-pill')}>
                                {(() => {
                                    const Icon = TYPE_ICON[report.type?.name];
                                    return Icon ? <><Icon size={12} style={{ marginRight: 4 }} />{getTypeLabel(report.type?.name)}</> : getTypeLabel(report.type?.name);
                                })()}
                            </span>
                            <span className={cx('status-pill')} style={{ background: sc.bg, color: sc.color }}>
                                <span className={cx('status-dot')} style={{ background: sc.dot }} />
                                {sc.label}
                            </span>
                        </div>
                    </div>
                    <button className={cx('closeBtn')} onClick={onClose}><FiX /></button>
                </div>

                {/* Tabs */}
                <div className={cx('tabs')}>
                    <button
                        className={cx('tab', { active: activeTab === 'detail' })}
                        onClick={() => setActiveTab('detail')}
                    >Chi tiết</button>
                    <button
                        className={cx('tab', { active: activeTab === 'review' })}
                        onClick={() => setActiveTab('review')}
                    >Xử lý & Phạt</button>
                </div>

                {/* Body */}
                <div className={cx('body')}>
                    {activeTab === 'detail' ? (
                        <div className={cx('detail-view')}>
                            {/* Reporter & Reported */}
                            <div className={cx('info-grid')}>
                                <div className={cx('info-card')}>
                                    <span className={cx('info-label')}>Người báo cáo</span>
                                    <span className={cx('info-value')}>{report.reporterName || '—'}</span>
                                    <span className={cx('info-sub')}>{report.reporterId?.slice(0, 8)}...</span>
                                </div>
                                <div className={cx('info-card')}>
                                    <span className={cx('info-label')}>Người bị báo cáo</span>
                                    <span className={cx('info-value', 'warn')}>{report.reportedUserName || '—'}</span>
                                    <span className={cx('info-sub')}>{report.reportedUserId?.slice(0, 8)}...</span>
                                </div>
                            </div>

                            {/* Target */}
                            {(report.postTitle || report.orderId) && (
                                <div className={cx('target-card')}>
                                    <span className={cx('info-label')}>
                                        {report.postTitle ? 'Bài đăng bị báo cáo' : 'Đơn hàng bị báo cáo'}
                                    </span>
                                    <span className={cx('info-value')}>
                                        {report.postTitle || `#${report.orderId}`}
                                    </span>
                                </div>
                            )}

                            {/* Reason */}
                            <div className={cx('section')}>
                                <span className={cx('section-label')}>Lý do báo cáo</span>
                                <div className={cx('reason-chip')}>
                                    {report.reason?.displayName || report.reason?.name || '—'}
                                </div>
                            </div>

                            {/* Detail */}
                            <div className={cx('section')}>
                                <span className={cx('section-label')}>Mô tả chi tiết</span>
                                <p className={cx('detail-text')}>{report.detail || '—'}</p>
                            </div>

                            {/* Evidences */}
                            {report.evidences?.length > 0 && (
                                <div className={cx('section')}>
                                    <span className={cx('section-label')}>
                                        Ảnh minh chứng ({report.evidences.length})
                                    </span>
                                    <div className={cx('evidence-grid')}>
                                        {report.evidences.map((ev, i) => (
                                            <a key={i} href={ev.imageUrl} target="_blank" rel="noreferrer">
                                                <img src={ev.imageUrl} alt={`Minh chứng ${i + 1}`} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Applied penalties */}
                            {report.penalties?.length > 0 && (
                                <div className={cx('section')}>
                                    <span className={cx('section-label')}>Hình phạt đã áp dụng</span>
                                    <div className={cx('penalty-chips')}>
                                        {report.penalties.map((p, i) => {
                                            const info = ALL_PENALTIES.find(x => x.value === p.action);
                                            return (
                                                <span key={i} className={cx('penalty-chip', 'applied')}>
                                                    {(() => {
                                                        const Icon = info?.icon;
                                                        return Icon ? <Icon size={14} style={{ marginRight: 4 }} /> : null;
                                                    })()}
                                                    {info?.label || p.action}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Resolution */}
                            {report.resolutionNote && (
                                <div className={cx('section')}>
                                    <span className={cx('section-label')}>Ghi chú xử lý</span>
                                    <p className={cx('resolution-text')}>{report.resolutionNote}</p>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className={cx('timestamps')}>
                                <span>Tạo: {formatDate(report.createdAt)}</span>
                                {report.reviewedByName && (
                                    <span>• Xử lý bởi: {report.reviewedByName}</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={cx('review-view')}>
                            {/* PENDING: chỉ hiện nút Duyệt/Từ chối */}
                            {currentStatus === 'PENDING' && (
                                <>
                                    <div className={cx('action-buttons')}>
                                        <button
                                            className={cx('btn-approve')}
                                            onClick={() => handleReview('APPROVED')}
                                            disabled={isLoading}
                                        >
                                            <FiCheckCircle size={16} style={{ marginRight: 6 }} />
                                            Duyệt báo cáo
                                        </button>
                                        <button
                                            className={cx('btn-reject')}
                                            onClick={() => handleReview('REJECTED')}
                                            disabled={isLoading}
                                        >
                                            <FiX size={16} style={{ marginRight: 6 }} />
                                            Từ chối
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* APPROVED: hiện penalty grid + ghi chú + nút Xử lý xong */}
                            {currentStatus === 'APPROVED' && (
                                <>
                                    <div className={cx('confirm-notice')}>
                                        Báo cáo đã được duyệt. Vui lòng chọn hình phạt (nếu có) và bấm "Xử lý xong" để hoàn tất.
                                    </div>

                                    <div className={cx('section')}>
                                        <span className={cx('section-label')}>
                                            Chọn hình phạt ({selectedPenalties.length} đã chọn)
                                        </span>
                                        <div className={cx('penalty-grid')}>
                                            {ALL_PENALTIES.map((p) => {
                                                const selected = selectedPenalties.includes(p.value);
                                                return (
                                                    <div
                                                        key={p.value}
                                                        className={cx('penalty-item', { selected })}
                                                        onClick={() => togglePenalty(p.value)}
                                                    >
                                                        <div className={cx('penalty-icon')}>
                                                            <p.icon size={18} />
                                                        </div>
                                                        <div className={cx('penalty-info')}>
                                                            <span className={cx('penalty-label')}>{p.label}</span>
                                                            <span className={cx('penalty-desc')}>{p.desc}</span>
                                                        </div>
                                                        <div className={cx('penalty-check')}>
                                                            {selected ? <FiCheck size={14} /> : null}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className={cx('section')}>
                                        <span className={cx('section-label')}>Ghi chú xử lý</span>
                                        <textarea
                                            className={cx('resolution-input')}
                                            value={resolutionNote}
                                            onChange={e => setResolutionNote(e.target.value)}
                                            placeholder="Nhập ghi chú về kết quả xử lý (sẽ được thông báo đến người báo cáo)..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className={cx('action-buttons')}>
                                        <button
                                            className={cx('btn-process')}
                                            onClick={() => handleReview('PROCESSED')}
                                            disabled={isLoading}
                                        >
                                            <FiCheckCircle size={16} style={{ marginRight: 6 }} />
                                            Xử lý xong
                                        </button>
                                        <button
                                            className={cx('btn-reject')}
                                            onClick={() => handleReview('REJECTED')}
                                            disabled={isLoading}
                                        >
                                            <FiX size={16} style={{ marginRight: 6 }} />
                                            Từ chối
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* PROCESSED hoặc REJECTED: hiện thông báo đã xử lý */}
                            {(currentStatus === 'PROCESSED' || currentStatus === 'REJECTED') && (
                                <div className={cx('already-done')}>
                                    <span>Báo cáo đã được xử lý với trạng thái: </span>
                                    <strong style={{ color: sc.color }}>{sc.label}</strong>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Confirm Modal */}
                {confirmModal && (
                    <div className={cx('confirm-overlay')} onClick={() => setConfirmModal(false)}>
                        <div className={cx('confirm-box')} onClick={e => e.stopPropagation()}>
                            <h3>Xác nhận xử lý</h3>
                            <p>Bạn sắp thực hiện:</p>
                            <ul>
                                <li><strong>Trạng thái:</strong> {STATUS_CONFIG[confirmModalStatus]?.label}</li>
                                {selectedPenalties.length > 0 && (
                                    <li>
                                        <strong>Hình phạt ({selectedPenalties.length}):</strong>
                                        <ul>
                                            {selectedPenalties.map(p => {
                                                const info = ALL_PENALTIES.find(x => x.value === p);
                                                const Icon = info?.icon;
                                                return (
                                                    <li key={p}>
                                                        {Icon && <Icon size={14} style={{ marginRight: 4 }} />}
                                                        {info?.label}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                )}
                                {resolutionNote && (
                                    <li><strong>Note:</strong> {resolutionNote}</li>
                                )}
                            </ul>
                            <p className={cx('confirm-warning')}>Hành động này sẽ được áp dụng ngay. Tiếp tục?</p>
                            <div className={cx('confirm-actions')}>
                                <button className={cx('btn-cancel')} onClick={() => setConfirmModal(false)}>
                                    <FiX size={14} style={{ marginRight: 4 }} />
                                    Hủy
                                </button>
                                <button className={cx('btn-confirm')} onClick={handleConfirmSubmit}>
                                    <FiCheck size={14} style={{ marginRight: 4 }} />
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportDetailModal;
