import React from 'react';
import classNames from 'classnames/bind';
import {
    CTable, CTableHead, CTableBody, CTableRow,
    CTableHeaderCell, CTableDataCell,
    CButton, CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLink } from '@coreui/icons';
import styles from './ReportTable.module.scss';

const cx = classNames.bind(styles);

const getReportTypeLabel = (type) => {
    const types = { USER: 'Người dùng', POST: 'Bài đăng', ORDER: 'Đơn hàng' };
    return types[type] || type;
};

const getReportTypeColor = (type) => {
    const colors = { USER: 'primary', POST: 'info', ORDER: 'warning' };
    return colors[type] || 'secondary';
};

const getStatusConfig = (status) => {
    const configs = {
        PENDING:    { color: 'warning', label: 'Chờ xử lý' },
        APPROVED:   { color: 'success', label: 'Đã duyệt' },
        PROCESSED:  { color: 'info',    label: 'Đã xử lý' },
        REJECTED:   { color: 'danger',  label: 'Bị từ chối' },
    };
    return configs[status] || { color: 'secondary', label: status };
};

const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const ReportTable = ({ reports = [], onViewDetail }) => {
    if (!reports || reports.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <div>Không có báo cáo nào</div>
            </div>
        );
    }

    return (
        <CTable hover responsive align="middle" className="mb-0 border">
            <CTableHead color="light">
                <CTableRow>
                    <CTableHeaderCell style={{ width: '80px' }} className="text-center">#</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '120px' }} className="text-center">Loại</CTableHeaderCell>
                    <CTableHeaderCell>Lý do</CTableHeaderCell>
                    <CTableHeaderCell>Người báo cáo</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '130px' }} className="text-center">Trạng thái</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '160px' }}>Ngày tạo</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '110px' }} className="text-center">Thao tác</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody>
                {reports.map((report, index) => {
                    const statusConfig = getStatusConfig(report.status?.name);
                    return (
                        <CTableRow key={report.id}>
                            <CTableDataCell className="text-center text-muted">
                                <span title={report.id}>#{report.id?.substring(0, 8) || '—'}</span>
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                                <CBadge color={getReportTypeColor(report.type?.name)} shape="rounded-pill">
                                    {getReportTypeLabel(report.type?.name)}
                                </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                                <div
                                    className="text-truncate fw-semibold"
                                    style={{ maxWidth: '200px' }}
                                    title={report.reason?.displayName}
                                >
                                    {report.reason?.displayName || '—'}
                                </div>
                                {report.detail && (
                                    <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>
                                        {report.detail.length > 50 ? report.detail.substring(0, 50) + '…' : report.detail}
                                    </small>
                                )}
                            </CTableDataCell>
                            <CTableDataCell>
                                <div className="fw-semibold text-dark">
                                    {report.reporterName || '—'}
                                </div>
                                {report.reportedUserName && (
                                    <small className="text-muted">
                                        → {report.reportedUserName}
                                    </small>
                                )}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                                <CBadge color={statusConfig.color} shape="rounded-pill">
                                    {statusConfig.label}
                                </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-muted small">
                                {formatDate(report.createdAt)}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                                <CButton
                                    color="info"
                                    variant="ghost"
                                    size="sm"
                                    title="Xem chi tiết"
                                    onClick={() => onViewDetail?.(report)}
                                >
                                    <CIcon icon={cilLink} />
                                </CButton>
                            </CTableDataCell>
                        </CTableRow>
                    );
                })}
            </CTableBody>
        </CTable>
    );
};

export default ReportTable;
