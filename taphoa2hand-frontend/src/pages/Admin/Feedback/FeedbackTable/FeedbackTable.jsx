import React from 'react';
import classNames from 'classnames/bind';
import {
    CTable, CTableHead, CTableBody, CTableHeaderCell,
    CTableDataCell, CTableRow, CButton, CImage
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTrash, cilPencil } from '@coreui/icons';
import styles from './FeedbackTable.module.scss';
import RatingDisplay from '../../../../components/Feedback/RatingDisplay';

const cx = classNames.bind(styles);

const FeedbackTable = ({ feedbacks = [], onDelete, onEdit }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    if (!feedbacks || feedbacks.length === 0) {
        return (
            <div className={cx('empty')}>
                <p>Chưa có đánh giá nào</p>
            </div>
        );
    }

    return (
        <div className={cx('feedback-table')}>
            <CTable hover responsive>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell scope="col" style={{ width: '10%' }}>#</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '10%' }}>Người đánh giá</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '10%' }}>Người được đánh giá</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '10%' }}>Sao</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '22%' }}>Bình luận</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '8%' }}>Ngày tạo</CTableHeaderCell>
                        <CTableHeaderCell scope="col" style={{ width: '15%' }}>Thao tác</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {feedbacks.map((feedback, index) => (
                        <CTableRow key={feedback.id}>
                            <CTableDataCell>
                                <span className={cx('order-id')}>
                                    #{String(feedback.orderId || feedback.id || '').substring(0, 6).toUpperCase()}
                                </span>
                            </CTableDataCell>
                            <CTableDataCell>
                                <div className={cx('user-cell')}>
                                    <span className={cx('user-name')}>{feedback.reviewerName || '—'}</span>
                                </div>
                            </CTableDataCell>
                            <CTableDataCell>
                                <div className={cx('user-cell')}>
                                    <span className={cx('user-name')}>{feedback.targetUserName || '—'}</span>
                                </div>
                            </CTableDataCell>
                            <CTableDataCell>
                                <div className={cx('rating-cell')}>
                                    <RatingDisplay rating={feedback.rating} showText={false} />
                                    <span className={cx('rating-value')}>{feedback.rating}/5</span>
                                </div>
                            </CTableDataCell>
                            <CTableDataCell>
                                <span className={cx('comment')}>
                                    {feedback.comment
                                        ? feedback.comment.length > 80
                                            ? feedback.comment.substring(0, 80) + '…'
                                            : feedback.comment
                                        : <span className={cx('no-comment')}>Không có bình luận</span>
                                    }
                                </span>
                            </CTableDataCell>
                            <CTableDataCell>
                                <span className={cx('date')}>{formatDate(feedback.createdAt)}</span>
                            </CTableDataCell>
                            <CTableDataCell>
                                <div className={cx('action-buttons')}>
                                    <CButton
                                        color="primary"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onEdit?.(feedback)}
                                        className={cx('edit-btn')}
                                        title="Sửa"
                                    >
                                        <CIcon icon={cilPencil} size="sm" />
                                    </CButton>
                                    <CButton
                                        color="danger"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onDelete?.(feedback.id)}
                                        className={cx('delete-btn')}
                                        title="Xóa"
                                    >
                                        <CIcon icon={cilTrash} size="sm" />
                                    </CButton>
                                </div>
                            </CTableDataCell>
                        </CTableRow>
                    ))}
                </CTableBody>
            </CTable>
        </div>
    );
};

export default FeedbackTable;
