import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import {
    CCard, CCardBody, CCardHeader,
    CButton, CFormInput, CInputGroup, CInputGroupText,
    CPagination, CPaginationItem, CSpinner,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilPencil } from '@coreui/icons';

import FeedbackTable from './FeedbackTable/FeedbackTable';
import * as feedbackService from '../../../services/feedbackService';
import FeedbackPopup from '../../../components/Feedback/FeedbackPopup';
import styles from './AdminFeedbackPage.module.scss';

const cx = classNames.bind(styles);

function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [editModal, setEditModal] = useState({ open: false, feedback: null });
    const PAGE_SIZE = 10;

    const fetchFeedbacks = useCallback(async (page, keyword = '') => {
        setLoading(true);
        try {
            const response = await feedbackService.adminGetAllFeedbacks(page, PAGE_SIZE, keyword);
            if (response && response.code === 1000) {
                setFeedbacks(response.result.content || []);
                setTotalPages(response.result.totalPages || 1);
                setTotalElements(response.result.totalElements || 0);
            }
        } catch (error) {
            console.error('Lỗi fetch feedbacks:', error);
            toast.error('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeedbacks(currentPage, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, debouncedSearch, fetchFeedbacks]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
        try {
            await feedbackService.adminDeleteFeedback(feedbackId);
            toast.success('Xóa đánh giá thành công');
            fetchFeedbacks(currentPage, debouncedSearch);
        } catch (error) {
            console.error('Lỗi xóa feedback:', error);
            toast.error('Không thể xóa đánh giá');
        }
    };

    const handleEditFeedback = (feedback) => {
        setEditModal({ open: true, feedback });
    };

    const handleEditSuccess = (updated) => {
        setEditModal({ open: false, feedback: null });
        toast.success('Cập nhật đánh giá thành công');
        fetchFeedbacks(currentPage, debouncedSearch);
    };

    const renderPaginationItems = () => {
        const pages = [];
        const windowSize = 5;
        let start = Math.max(0, currentPage - Math.floor(windowSize / 2));
        let end = Math.min(totalPages, start + windowSize);
        start = Math.max(0, end - windowSize);
        for (let i = start; i < end; i++) {
            pages.push(
                <CPaginationItem
                    key={i}
                    active={i === currentPage}
                    onClick={() => setCurrentPage(i)}
                >
                    {i + 1}
                </CPaginationItem>
            );
        }
        return pages;
    };

    return (
        <div className={cx('feedback-page')}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">Quản lý đánh giá</h3>
                <div className="d-flex align-items-center gap-2">
                    <CInputGroup style={{ maxWidth: '300px' }}>
                        <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                        <CFormInput
                            placeholder="Tìm kiếm (người đánh giá, bình luận)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <CButton color="secondary" variant="outline" onClick={() => { setSearchTerm(''); setDebouncedSearch(''); setCurrentPage(0); }}>
                                ✕
                            </CButton>
                        )}
                    </CInputGroup>
                </div>
            </div>

            <CCard className="mb-4 shadow-sm border-0">
                <CCardHeader className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">
                            Tổng: <strong>{totalElements}</strong> đánh giá
                        </span>
                    </div>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className="text-center py-5">
                            <CSpinner color="primary" />
                            <div className="mt-2 text-muted small">Đang tải dữ liệu...</div>
                        </div>
                    ) : (
                        <FeedbackTable
                            feedbacks={feedbacks}
                            onDelete={handleDeleteFeedback}
                            onEdit={handleEditFeedback}
                        />
                    )}

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-end mt-4">
                            <CPagination>
                                <CPaginationItem
                                    disabled={currentPage === 0}
                                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                >
                                    Trước
                                </CPaginationItem>
                                {renderPaginationItems()}
                                <CPaginationItem
                                    disabled={currentPage >= totalPages - 1}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                                >
                                    Sau
                                </CPaginationItem>
                            </CPagination>
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="text-center mt-1">
                            <small className="text-muted">Trang {currentPage + 1} / {totalPages}</small>
                        </div>
                    )}
                </CCardBody>
            </CCard>

            {/* Edit Modal */}
            <CModal
                visible={editModal.open}
                onClose={() => setEditModal({ open: false, feedback: null })}
                size="lg"
                backdrop="static"
            >
                <CModalHeader>
                    <CModalTitle>
                        <CIcon icon={cilPencil} className="me-2" />
                        Chỉnh sửa đánh giá
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {editModal.feedback && (
                        <FeedbackPopup
                            feedback={editModal.feedback}
                            mode="edit"
                            onSuccess={handleEditSuccess}
                            onCancel={() => setEditModal({ open: false, feedback: null })}
                        />
                    )}
                </CModalBody>
            </CModal>
        </div>
    );
}

export default AdminFeedbackPage;
