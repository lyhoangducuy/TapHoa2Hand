import React from 'react';
import {
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
    CButton, CBadge, CSpinner,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilClock, cilUser, cilInfo, cilLinkAlt } from '@coreui/icons';

const NotificationDetailModal = ({ visible, onClose, notification }) => {
    if (!notification) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <CModal size="lg" visible={visible} onClose={onClose} backdrop="static">
            <CModalHeader>
                <CModalTitle>
                    <CIcon icon={cilInfo} className="me-2" />
                    Chi tiết thông báo
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                {/* Meta info bar */}
                <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                    <div className="d-flex gap-2 align-items-center">
                        <CIcon icon={cilClock} className="text-muted" />
                        <small className="text-muted">{formatDate(notification.createdAt)}</small>
                    </div>
                    {notification.read ? (
                        <CBadge color="success" shape="rounded-pill">Đã đọc</CBadge>
                    ) : (
                        <CBadge color="danger" shape="rounded-pill">Chưa đọc</CBadge>
                    )}
                </div>

                {/* Người tạo */}
                <div className="mb-3 p-3 border rounded bg-white">
                    <div className="text-muted small mb-1">
                        <CIcon icon={cilUser} className="me-1" /> Người tạo
                    </div>
                    <div className="fw-semibold">
                        {notification.createdByUsername || notification.createdById || '—'}
                    </div>
                </div>

                {/* Nội dung */}
                <div className="mb-3">
                    <div className="text-muted small mb-2 fw-bold">Nội dung thông báo</div>
                    <div
                        className="p-3 bg-light rounded border"
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '60px' }}
                    >
                        {notification.content || '—'}
                    </div>
                </div>

                {/* Link đính kèm */}
                <div className="mb-3">
                    <div className="text-muted small mb-2 fw-bold">
                        <CIcon icon={cilLinkAlt} className="me-1" /> Link đính kèm
                    </div>
                    {notification.link ? (
                        <a
                            href={notification.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none d-inline-flex align-items-center gap-1"
                        >
                            <CIcon icon={cilLinkAlt} />
                            {notification.link}
                        </a>
                    ) : (
                        <span className="text-muted fst-italic">Không có</span>
                    )}
                </div>

                {/* Danh sách người nhận */}
                <div>
                    <div className="text-muted small mb-2 fw-bold">
                        <CIcon icon={cilUser} className="me-1" />
                        Danh sách người nhận ({notification.receivers?.length || 0} người)
                    </div>
                    <div
                        className="border rounded p-2 bg-white"
                        style={{ maxHeight: '250px', overflowY: 'auto' }}
                    >
                        {notification.receivers && notification.receivers.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                                {notification.receivers.map((receiver, index) => (
                                    <CBadge
                                        key={receiver.id || index}
                                        color="secondary"
                                        shape="rounded-pill"
                                        className="px-3 py-2"
                                        style={{ fontSize: '0.85rem', fontWeight: 'normal' }}
                                    >
                                        <CIcon icon={cilUser} className="me-1" />
                                        {receiver.username || receiver.id || '—'}
                                    </CBadge>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted py-3">Không có người nhận</div>
                        )}
                    </div>
                </div>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" variant="ghost" onClick={onClose}>
                    Đóng
                </CButton>
            </CModalFooter>
        </CModal>
    );
};

export default NotificationDetailModal;
