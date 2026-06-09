import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ReportDetailModal.module.scss';
import {
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
    CButton, CBadge, CSpinner, CFormTextarea,
    CNav, CNavItem, CNavLink,
    CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilCheck, cilX, cilWarning, cilDollar, cilUser,
    cilFile, cilInfo, cilCheckCircle, cilBan, cilLockUnlocked,
} from '@coreui/icons';
import { updateReportStatus } from '../../../../services/reportAdminService';
import { updateOrderStatus } from '../../../../services/orderService';
import { blockUser } from '../../../../services/adminUserService';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const ALL_PENALTIES = [
    { value: 'WARNING', label: 'Cảnh cáo', icon: cilWarning, desc: 'Gửi cảnh báo đến tài khoản' },
    { value: 'BAN_24H', label: 'Khóa 24 giờ', icon: cilBan, desc: 'Khóa tài khoản trong 24 giờ' },
    { value: 'PERMANENT_BAN', label: 'Khóa vĩnh viễn', icon: cilBan, desc: 'Cấm vĩnh viễn khỏi nền tảng' },
    { value: 'REFUND_BUYER', label: 'Hoàn tiền người mua', icon: cilDollar, desc: 'Hoàn tiền cho người mua' },
    { value: 'REFUND_REPORTER', label: 'Hoàn tiền người tố cáo', icon: cilDollar, desc: 'Hoàn tiền cho người tố cáo' },
];

const STATUS_CONFIG = {
    PENDING:    { color: 'warning', label: 'Chờ xử lý' },
    APPROVED:   { color: 'info',    label: 'Đã duyệt' },
    PROCESSED:  { color: 'success', label: 'Đã xử lý' },
    REJECTED:   { color: 'danger',  label: 'Bị từ chối' },
};

const TYPE_CONFIG = {
    USER: { label: 'Báo cáo người dùng', icon: cilUser },
    POST: { label: 'Báo cáo bài đăng', icon: cilFile },
    ORDER: { label: 'Báo cáo đơn hàng', icon: cilInfo },
};

// Determine user lock status from report data (non-hardcoded)
const getUserLockStatus = (report) => {
    // Priority: blockedUntil field tells us the actual state
    const blockedUntil = report.reportedUserBlockedUntil || report.blockedUntil;
    if (!blockedUntil) return 'ACTIVE';

    const blockedTime = new Date(blockedUntil);
    if (blockedTime > new Date()) {
        // Check if it's 24h ban
        const now = new Date();
        const diffHours = (blockedTime - now) / (1000 * 60 * 60);
        if (diffHours <= 25) {
            return 'LOCKED_24H';
        }
        return 'PERMANENTLY_LOCKED';
    }
    return 'ACTIVE';
};

const LOCK_STATUS_CONFIG = {
    ACTIVE:              { color: 'success', label: 'Đang hoạt động', icon: cilLockUnlocked },
    LOCKED_24H:         { color: 'warning', label: 'Khóa 24 giờ', icon: cilBan },
    PERMANENTLY_LOCKED:  { color: 'danger',  label: 'Khóa vĩnh viễn', icon: cilBan },
};

const ReportDetailModal = ({ report, isOpen, onClose, onStatusUpdate, onReportProcessed }) => {
    const [activeTab, setActiveTab] = useState('detail');
    const [isLoading, setIsLoading] = useState(false);

    // Penalty selection
    const [selectedPenalties, setSelectedPenalties] = useState([]);
    const [resolutionNote, setResolutionNote] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // Reset form when report changes
    useEffect(() => {
        if (report) {
            setResolutionNote(report.resolutionNote || '');
            setSelectedPenalties((report.penalties || []).map(p => p.action));
            setActiveTab('detail');
            setShowConfirm(false);
            setConfirmAction(null);
        }
    }, [report]);

    if (!isOpen || !report) return null;

    const currentStatus = report.status?.name || 'PENDING';
    const sc = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;

    // Compute lock status from data (no hardcoding)
    const userLockStatus = getUserLockStatus(report);
    const lockConfig = LOCK_STATUS_CONFIG[userLockStatus] || LOCK_STATUS_CONFIG.ACTIVE;
    const LockIcon = lockConfig.icon;

    const togglePenalty = (value) => {
        setSelectedPenalties(prev =>
            prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
        );
    };

    const handleReview = (targetStatus) => {
        setConfirmAction(targetStatus);
        setShowConfirm(true);
    };

    // ── Submit report processing ──────────────────────────────────────────────
    const handleConfirmSubmit = async () => {
        setShowConfirm(false);
        try {
            setIsLoading(true);

            if (report.orderId && selectedPenalties.includes('REFUND_BUYER')) {
                await updateOrderStatus(report.orderId, 'RETURNED');
            }

            // Determine if any ban penalty is selected and which duration
            const hasPermanentBan = selectedPenalties.includes('PERMANENT_BAN');
            const has24hBan = selectedPenalties.includes('BAN_24H');

            if ((hasPermanentBan || has24hBan) && report.reportedUserId) {
                // Block user BEFORE updating report to PROCESSED
                const durationHours = hasPermanentBan ? null : 24;
                const reason = resolutionNote || 'Vi phạm nghiêm trọng theo báo cáo';
                await blockUser(report.reportedUserId, reason, durationHours);
                const banLabel = hasPermanentBan ? 'vĩnh viễn' : '24 giờ';
                toast.success(`Đã khóa tài khoản ${banLabel}!`);
            }

            await updateReportStatus(report.id, confirmAction);
            toast.success('Xử lý báo cáo thành công!');
            onReportProcessed?.();
            onStatusUpdate?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Xử lý thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    const typeInfo = TYPE_CONFIG[report.type?.name] || { label: report.type?.name, icon: cilInfo };
    const TypeIcon = typeInfo.icon;

    // Count penalties by type for confirmation display
    const hasRefund = selectedPenalties.includes('REFUND_BUYER') || selectedPenalties.includes('REFUND_REPORTER');
    const hasBan = selectedPenalties.includes('BAN_24H') || selectedPenalties.includes('PERMANENT_BAN');

    return (
        <>
            <CModal size="lg" visible={isOpen} onClose={onClose} backdrop="static">
                <CModalHeader>
                    <CModalTitle>
                        <CIcon icon={cilInfo} className="me-2" />
                        Chi tiết báo cáo
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {/* Meta info bar */}
                    <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                        <div className="d-flex gap-2 align-items-center">
                            <small className="text-muted text-truncate" style={{ maxWidth: '150px' }}>
                                ID: {report.id?.slice(0, 12)}...
                            </small>
                            <CBadge color="secondary" shape="rounded-pill">
                                <CIcon icon={TypeIcon} className="me-1" />
                                {typeInfo.label}
                            </CBadge>
                        </div>
                        <CBadge color={sc.color} shape="rounded-pill" className="px-3 py-2">
                            {sc.label}
                        </CBadge>
                    </div>

                    {/* Tabs */}
                    <CNav variant="tabs" className="mb-3">
                        <CNavItem>
                            <CNavLink
                                active={activeTab === 'detail'}
                                onClick={() => setActiveTab('detail')}
                                style={{ cursor: 'pointer' }}
                            >
                                <CIcon icon={cilInfo} className="me-1" /> Chi tiết
                            </CNavLink>
                        </CNavItem>
                        <CNavItem>
                            <CNavLink
                                active={activeTab === 'review'}
                                onClick={() => setActiveTab('review')}
                                style={{ cursor: 'pointer' }}
                            >
                                <CIcon icon={cilCheckCircle} className="me-1" /> Xử lý & Phạt
                            </CNavLink>
                        </CNavItem>
                    </CNav>

                    {/* ─── Tab: Detail ───────────────────────────────────────────── */}
                    {activeTab === 'detail' && (
                        <div>
                            {/* Reporter & Reported */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <div className="p-3 border rounded bg-white">
                                        <div className="text-muted small mb-1">Người báo cáo</div>
                                        <div className="fw-semibold">{report.reporterName || '—'}</div>
                                        <small className="text-muted">{report.reporterId?.slice(0, 8)}...</small>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 border rounded bg-white">
                                        <div className="text-muted small mb-1">Người bị báo cáo</div>
                                        <div className="fw-semibold text-danger">{report.reportedUserName || '—'}</div>
                                        <small className="text-muted">{report.reportedUserId?.slice(0, 8)}...</small>

                                        {/* User lock status — read-only, no action buttons */}
                                        <div className="mt-2 d-flex align-items-center gap-2">
                                            <CBadge color={lockConfig.color} shape="rounded-pill">
                                                <CIcon icon={LockIcon} className="me-1" />
                                                {lockConfig.label}
                                            </CBadge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Target */}
                            {(report.postTitle || report.orderId) && (
                                <div className="mb-3 p-3 border rounded bg-white">
                                    <div className="text-muted small mb-1">
                                        {report.postTitle ? 'Bài đăng bị báo cáo' : 'Đơn hàng bị báo cáo'}
                                    </div>
                                    <div className="fw-semibold">{report.postTitle || `#${report.orderId}`}</div>
                                </div>
                            )}

                            {/* Reason */}
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Lý do báo cáo</label>
                                <div>
                                    <CBadge color="warning" shape="rounded-pill" className="px-3 py-2">
                                        {report.reason?.displayName || report.reason?.name || '—'}
                                    </CBadge>
                                </div>
                            </div>

                            {/* Detail */}
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Mô tả chi tiết</label>
                                <div
                                    className="p-3 bg-light rounded border"
                                    style={{ whiteSpace: 'pre-wrap', minHeight: '60px' }}
                                >
                                    {report.detail || '—'}
                                </div>
                            </div>

                            {/* Evidences */}
                            {report.evidences?.length > 0 && (
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">
                                        Ảnh minh chứng ({report.evidences.length})
                                    </label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {report.evidences.map((ev, i) => (
                                            <a key={i} href={ev.imageUrl} target="_blank" rel="noreferrer">
                                                <img
                                                    src={ev.imageUrl}
                                                    alt={`Minh chứng ${i + 1}`}
                                                    style={{
                                                        width: '80px', height: '80px',
                                                        objectFit: 'cover', borderRadius: '8px',
                                                        border: '1px solid #dee2e6',
                                                    }}
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Penalties */}
                            {report.penalties?.length > 0 && (
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Hình phạt đã áp dụng</label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {report.penalties.map((p, i) => {
                                            const info = ALL_PENALTIES.find(x => x.value === p.action);
                                            const PenaltyIcon = info?.icon || cilWarning;
                                            return (
                                                <CBadge key={i} color="danger" shape="rounded-pill" className="px-3 py-2">
                                                    <CIcon icon={PenaltyIcon} className="me-1" />
                                                    {info?.label || p.action}
                                                </CBadge>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Resolution */}
                            {report.resolutionNote && (
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">Ghi chú xử lý</label>
                                    <div className="p-3 bg-light rounded border">
                                        {report.resolutionNote}
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="d-flex gap-3 text-muted small">
                                <span>Tạo: {formatDate(report.createdAt)}</span>
                                {report.reviewedByName && <span>• Xử lý bởi: {report.reviewedByName}</span>}
                            </div>
                        </div>
                    )}

                    {/* ─── Tab: Review ───────────────────────────────────────────── */}
                    {activeTab === 'review' && (
                        <div>
                            {currentStatus === 'PENDING' && (
                                <div className="mb-3 p-3 border border-warning rounded bg-warning bg-opacity-10">
                                    <div className="d-flex align-items-center mb-2">
                                        <CIcon icon={cilWarning} className="text-warning me-2" />
                                        <strong>Báo cáo đang chờ xử lý</strong>
                                    </div>
                                    <p className="mb-0 text-muted small">
                                        Bạn có thể duyệt báo cáo để tiếp tục xử lý, hoặc từ chối nếu báo cáo không hợp lệ.
                                    </p>
                                </div>
                            )}

                            {currentStatus === 'PENDING' && (
                                <div className="d-flex gap-2 mb-3">
                                    <CButton
                                        color="success"
                                        onClick={() => handleReview('APPROVED')}
                                        disabled={isLoading}
                                    >
                                        <CIcon icon={cilCheckCircle} className="me-2" />
                                        Duyệt báo cáo
                                    </CButton>
                                    <CButton
                                        color="danger"
                                        variant="outline"
                                        onClick={() => handleReview('REJECTED')}
                                        disabled={isLoading}
                                    >
                                        <CIcon icon={cilX} className="me-2" />
                                        Từ chối
                                    </CButton>
                                </div>
                            )}

                            {currentStatus === 'APPROVED' && (
                                <div>
                                    <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
                                        <CIcon icon={cilInfo} className="me-2" />
                                        Báo cáo đã được duyệt. Chọn hình phạt (nếu có) và bấm "Xử lý xong" để hoàn tất.
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-label text-muted small fw-bold">
                                            Chọn hình phạt ({selectedPenalties.length} đã chọn)
                                        </div>
                                        <div className="row g-2">
                                            {ALL_PENALTIES.map((p) => {
                                                const selected = selectedPenalties.includes(p.value);
                                                const PenaltyIcon = p.icon;
                                                return (
                                                    <div key={p.value} className="col-md-6">
                                                        <div
                                                            className={`p-3 border rounded ${selected ? 'border-primary bg-primary bg-opacity-5' : ''}`}
                                                            onClick={() => togglePenalty(p.value)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <CIcon icon={PenaltyIcon} className="text-primary" />
                                                                    <div>
                                                                        <div className="fw-semibold small">{p.label}</div>
                                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.desc}</div>
                                                                    </div>
                                                                </div>
                                                                {selected && <CIcon icon={cilCheck} className="text-success" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold">Ghi chú xử lý</label>
                                        <CFormTextarea
                                            rows={3}
                                            value={resolutionNote}
                                            onChange={(e) => setResolutionNote(e.target.value)}
                                            placeholder="Nhập ghi chú về kết quả xử lý (sẽ được thông báo đến người báo cáo)..."
                                        />
                                    </div>

                                    <div className="d-flex gap-2">
                                        <CButton
                                            color="success"
                                            onClick={() => handleReview('PROCESSED')}
                                            disabled={isLoading}
                                        >
                                            <CIcon icon={cilCheckCircle} className="me-2" />
                                            Xử lý xong
                                        </CButton>
                                        <CButton
                                            color="danger"
                                            variant="outline"
                                            onClick={() => handleReview('REJECTED')}
                                            disabled={isLoading}
                                        >
                                            <CIcon icon={cilX} className="me-2" />
                                            Từ chối
                                        </CButton>
                                    </div>
                                </div>
                            )}

                            {(currentStatus === 'PROCESSED' || currentStatus === 'REJECTED') && (
                                <div className="alert alert-secondary d-flex align-items-center" role="alert">
                                    <CIcon icon={cilInfo} className="me-2" />
                                    Báo cáo đã được xử lý với trạng thái:{' '}
                                    <CBadge color={sc.color} className="ms-2">{sc.label}</CBadge>
                                </div>
                            )}
                        </div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" variant="ghost" onClick={onClose} disabled={isLoading}>
                        Đóng
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* ─── Confirm sub-modal (approve/reject/process) ──────────────────── */}
            {showConfirm && (
                <CModal visible={showConfirm} onClose={() => setShowConfirm(false)} centered size="sm" backdrop="static">
                    <CModalHeader>
                        <CModalTitle>Xác nhận xử lý</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p className="mb-2">Bạn sắp thực hiện:</p>
                        <ul className="mb-2">
                            <li><strong>Trạng thái:</strong> {STATUS_CONFIG[confirmAction]?.label}</li>
                            {selectedPenalties.length > 0 && (
                                <li>
                                    <strong>Hình phạt ({selectedPenalties.length}):</strong>
                                    <ul>
                                        {selectedPenalties.map(p => {
                                            const info = ALL_PENALTIES.find(x => x.value === p);
                                            return <li key={p}>{info?.label || p}</li>;
                                        })}
                                    </ul>
                                </li>
                            )}
                            {resolutionNote && <li><strong>Ghi chú:</strong> {resolutionNote}</li>}
                        </ul>

                        {/* Warning: if ban is selected, show banner */}
                        {hasBan && (
                            <CAlert color="danger" className="py-2">
                                <CIcon icon={cilBan} className="me-1" />
                                <strong>Cảnh báo:</strong>{' '}
                                {selectedPenalties.includes('PERMANENT_BAN')
                                    ? 'Người dùng sẽ bị khóa tài khoản vĩnh viễn ngay sau khi xác nhận.'
                                    : 'Người dùng sẽ bị khóa tài khoản trong 24 giờ ngay sau khi xác nhận.'}
                            </CAlert>
                        )}

                        {hasRefund && !hasBan && (
                            <div className="alert alert-warning py-2 small mb-0">
                                <CIcon icon={cilDollar} className="me-1" />
                                Hành động này sẽ được áp dụng ngay.
                            </div>
                        )}
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" variant="ghost" onClick={() => setShowConfirm(false)} disabled={isLoading}>
                            Hủy
                        </CButton>
                        <CButton color="primary" onClick={handleConfirmSubmit} disabled={isLoading}>
                            {isLoading ? <CSpinner size="sm" /> : <><CIcon icon={cilCheck} className="me-1" /> Xác nhận</>}
                        </CButton>
                    </CModalFooter>
                </CModal>
            )}
        </>
    );
};

export default ReportDetailModal;
