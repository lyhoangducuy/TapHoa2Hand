import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import {
    CCard, CCardBody, CCardHeader, CButton, CFormInput,
    CInputGroup, CInputGroupText, CPagination, CPaginationItem,
    CModal, CModalHeader, CModalBody, CModalFooter, CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilTrash, cilPencil } from '@coreui/icons';

import FeedbackTable from './FeedbackTable/FeedbackTable';
import * as feedbackService from '../../../services/feedbackService';
import FeedbackPopup from '../../../components/Feedback/FeedbackPopup';
import RatingDisplay from '../../../components/Feedback/RatingDisplay';
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

    // Debounce search
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
        const start = Math.max(0, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);

        if (start > 0) {
            pages.push(
                <CPaginationItem key={0} onClick={() => setCurrentPage(0)}>1</CPaginationItem>,
            );
            if (start > 1) pages.push(<CPaginationItem key="ellipsis1" disabled>…</CPaginationItem>);
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <CPaginationItem key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
                    {i + 1}
                </CPaginationItem>
            );
        }

        if (end < totalPages - 1) {
            if (end < totalPages - 2) pages.push(<CPaginationItem key="ellipsis2" disabled>…</CPaginationItem>);
            pages.push(
                <CPaginationItem key={totalPages - 1} onClick={() => setCurrentPage(totalPages - 1)}>
                    {totalPages}
                </CPaginationItem>
            );
        }
        return pages;
    };

    return (
        <div className={cx('feedback-page')}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">📋 Quản lý đánh giá</h3>
                <span className={cx('total-badge')}>
                    Tổng: <strong>{totalElements}</strong> đánh giá
                </span>
            </div>

            <CCard className="mb-4 shadow-sm border-0">
                <CCardHeader className="bg-white py-3">
                    <CInputGroup className="w-50">
                        <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                        <CFormInput
                            placeholder="Tìm kiếm theo tên người đánh giá, bình luận..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <CButton color="secondary" variant="outline" onClick={() => { setSearchTerm(''); setDebouncedSearch(''); setCurrentPage(0); }}>
                                ✕
                            </CButton>
                        )}
                    </CInputGroup>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className="text-center py-5">
                            <CSpinner color="primary" />
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
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    ← Trước
                                </CPaginationItem>
                                {renderPaginationItems()}
                                <CPaginationItem
                                    disabled={currentPage >= totalPages - 1}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Sau →
                                </CPaginationItem>
                            </CPagination>
                        </div>
                    )}
                </CCardBody>
            </CCard>

            {/* Edit Modal */}
            <CModal
                visible={editModal.open}
                onClose={() => setEditModal({ open: false, feedback: null })}
                size="lg"
                centered
            >
                <CModalHeader closeButton>
                    <CIcon icon={cilPencil} className="me-2" />
                    Chỉnh sửa đánh giá
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
