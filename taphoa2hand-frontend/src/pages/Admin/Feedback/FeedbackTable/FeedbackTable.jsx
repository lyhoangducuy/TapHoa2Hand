import React from 'react';
import {
    CTable, CTableHead, CTableBody, CTableRow,
    CTableHeaderCell, CTableDataCell,
    CButton, CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';
import RatingDisplay from '../../../../components/Feedback/RatingDisplay';

const FeedbackTable = ({ feedbacks = [], onDelete, onEdit }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (!feedbacks || feedbacks.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                Chưa có đánh giá nào
            </div>
        );
    }

    return (
        <CTable hover responsive align="middle" className="mb-0 border">
            <CTableHead color="light">
                <CTableRow>
                    <CTableHeaderCell style={{ width: '80px' }} className="text-center">#</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '140px' }}>Người đánh giá</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '140px' }}>Người được đánh giá</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '100px' }} className="text-center">Sao</CTableHeaderCell>
                    <CTableHeaderCell>Bình luận</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '160px' }}>Ngày tạo</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '120px' }} className="text-center">Thao tác</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody>
                {feedbacks.map((feedback, index) => (
                    <CTableRow key={feedback.id}>
                        <CTableDataCell className="text-center text-muted">
                            #{String(feedback.orderId || feedback.id || '').substring(0, 6).toUpperCase()}
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="fw-semibold text-dark">
                                {feedback.reviewerName || '—'}
                            </div>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="fw-semibold text-dark">
                                {feedback.targetUserName || '—'}
                            </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                            <div className="d-flex align-items-center justify-content-center gap-1">
                                <RatingDisplay rating={feedback.rating} showText={false} />
                                <span className="fw-bold text-warning">{feedback.rating}/5</span>
                            </div>
                        </CTableDataCell>
                        <CTableDataCell>
                            <div
                                className="text-truncate text-muted"
                                style={{ maxWidth: '200px' }}
                                title={feedback.comment}
                            >
                                {feedback.comment
                                    ? feedback.comment.length > 80
                                        ? feedback.comment.substring(0, 80) + '…'
                                        : feedback.comment
                                    : <span className="fst-italic">Không có bình luận</span>
                                }
                            </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-muted small">
                            {formatDate(feedback.createdAt)}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                                <CButton
                                    color="info"
                                    variant="ghost"
                                    size="sm"
                                    title="Sửa"
                                    onClick={() => onEdit?.(feedback)}
                                >
                                    <CIcon icon={cilPencil} />
                                </CButton>
                                <CButton
                                    color="danger"
                                    variant="ghost"
                                    size="sm"
                                    title="Xóa"
                                    onClick={() => onDelete?.(feedback.id)}
                                >
                                    <CIcon icon={cilTrash} />
                                </CButton>
                            </div>
                        </CTableDataCell>
                    </CTableRow>
                ))}
            </CTableBody>
        </CTable>
    );
};

export default FeedbackTable;
