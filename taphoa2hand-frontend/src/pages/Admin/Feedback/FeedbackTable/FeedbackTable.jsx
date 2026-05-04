import React from 'react';
import classNames from 'classnames/bind';
import { 
  CTable, CTableHead, CTableBody, CTableHeaderCell, 
  CTableDataCell, CTableRow, CButton 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTrash } from '@coreui/icons';
import styles from './FeedbackTable.module.scss';
import RatingDisplay from '../../../../components/Feedback/RatingDisplay';

const cx = classNames.bind(styles);

const FeedbackTable = ({ feedbacks = [], onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
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
            <CTableHeaderCell scope="col" style={{ width: '15%' }}>
              Người đánh giá
            </CTableHeaderCell>
            <CTableHeaderCell scope="col" style={{ width: '15%' }}>
              Người được đánh giá
            </CTableHeaderCell>
            <CTableHeaderCell scope="col" style={{ width: '10%' }}>
              Số sao
            </CTableHeaderCell>
            <CTableHeaderCell scope="col" style={{ width: '30%' }}>
              Bình luận
            </CTableHeaderCell>
            <CTableHeaderCell scope="col" style={{ width: '15%' }}>
              Ngày tạo
            </CTableHeaderCell>
            <CTableHeaderCell scope="col" style={{ width: '15%' }}>
              Thao tác
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {feedbacks.map((feedback) => (
            <CTableRow key={feedback.id}>
              <CTableDataCell>
                <span className={cx('user-name')}>
                  {feedback.reviewerName}
                </span>
              </CTableDataCell>
              <CTableDataCell>
                <span className={cx('user-name')}>
                  {feedback.targetUserName}
                </span>
              </CTableDataCell>
              <CTableDataCell>
                <div className={cx('rating-cell')}>
                  <RatingDisplay 
                    rating={feedback.rating} 
                    showText={false}
                  />
                  <span className={cx('rating-value')}>
                    {feedback.rating}/5
                  </span>
                </div>
              </CTableDataCell>
              <CTableDataCell>
                <span className={cx('comment')}>
                  {feedback.comment ? feedback.comment.substring(0, 50) + '...' : 'Không có bình luận'}
                </span>
              </CTableDataCell>
              <CTableDataCell>
                <span className={cx('date')}>
                  {formatDate(feedback.createdAt)}
                </span>
              </CTableDataCell>
              <CTableDataCell>
                <CButton 
                  color="danger" 
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(feedback.id)}
                  className={cx('delete-btn')}
                >
                  <CIcon icon={cilTrash} size="sm" />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>
  );
};

export default FeedbackTable;
