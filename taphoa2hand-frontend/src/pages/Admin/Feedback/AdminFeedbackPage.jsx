import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import styles from './AdminFeedbackPage.module.scss';
import { 
  CCard, CCardBody, CCardHeader, CButton, CFormInput, 
  CInputGroup, CInputGroupText, CPagination, CPaginationItem 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilTrash } from '@coreui/icons';

import FeedbackTable from './FeedbackTable/FeedbackTable';
import * as feedbackService from '../../../services/feedbackService';

const cx = classNames.bind(styles);

function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeedbacks(currentPage);
  }, [currentPage]);

  const fetchFeedbacks = async (page) => {
    setLoading(true);
    try {
      const response = await feedbackService.adminGetAllFeedbacks(page, 10);
      if (response && response.code === 1000) {
        setFeedbacks(response.result.content || []);
        setTotalPages(response.result.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi fetch feedbacks:", error);
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        await feedbackService.adminDeleteFeedback(feedbackId);
        toast.success('Xóa đánh giá thành công');
        fetchFeedbacks(currentPage);
      } catch (error) {
        console.error("Lỗi xóa feedback:", error);
        toast.error("Không thể xóa đánh giá");
      }
    }
  };

  const renderPaginationItems = () => {
    let items = [];
    for (let i = 0; i < totalPages; i++) {
      items.push(
        <CPaginationItem 
          key={i} active={i === currentPage} 
          onClick={() => setCurrentPage(i)}
          style={{ cursor: 'pointer' }}
        >
          {i + 1}
        </CPaginationItem>
      );
    }
    return items;
  };

  return (
    <div className={cx('feedback-page')}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">Quản lý đánh giá</h3>
      </div>

      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white py-3">
          <CInputGroup className="w-50">
            <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
            <CFormInput 
              placeholder="Tìm kiếm đánh giá..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CInputGroup>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center">
              <p>Đang tải...</p>
            </div>
          ) : (
            <FeedbackTable 
              feedbacks={feedbacks} 
              onDelete={handleDeleteFeedback}
            />
          )}
          
          {totalPages > 0 && (
            <div className="d-flex justify-content-end mt-4">
              <CPagination>
                <CPaginationItem 
                  disabled={currentPage === 0} 
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Trước
                </CPaginationItem>
                {renderPaginationItems()}
                <CPaginationItem 
                  disabled={currentPage === totalPages - 1} 
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
}

export default AdminFeedbackPage;
