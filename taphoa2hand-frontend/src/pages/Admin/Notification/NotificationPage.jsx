import React, { useEffect, useState } from 'react';
import {
    CCard, CCardBody, CCardHeader,
    CButton, CInputGroup, CFormInput, CSpinner, CBadge,
    CPagination, CPaginationItem,
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTrash, cilPlus, cilCheckCircle, cilSearch, cilLink, cilZoom } from '@coreui/icons';

import CreateNotificationModal from './Create/CreateNotificationModal';
import NotificationDetailModal from './Detail/NotificationDetailModal';
import { getToken } from '../../../services/localstorageService';
import { initiateSocketConnection } from '../../../services/socketService';
import {
    getAdminNotifications,
    deleteNotification,
    markNotificationAsRead,
} from '../../../services/notificationService';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        const token = getToken();
        if (token) {
            initiateSocketConnection(token);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [currentPage, pageSize]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getAdminNotifications(currentPage, pageSize);
            if (data && data.content) {
                setNotifications(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            } else if (Array.isArray(data)) {
                setNotifications(data);
                setTotalPages(1);
                setTotalElements(data.length);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0);
    };

    const handleViewDetail = (notification) => {
        setSelectedNotification(notification);
        setDetailModalVisible(true);
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await markNotificationAsRead(id);
            setNotifications((prev) =>
                prev.map((noti) => (noti.id === id ? { ...noti, read: true } : noti))
            );
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            try {
                await deleteNotification(id);
                fetchNotifications();
            } catch (error) {
                console.error('Lỗi khi xóa', error);
            }
        }
    };

    const handleModalSuccess = () => {
        setModalVisible(false);
        fetchNotifications();
    };

    const formatReceiversPreview = (receivers) => {
        if (!receivers || receivers.length === 0) return 'Không có người nhận';
        if (receivers.length <= 3) {
            return receivers.map((r) => r.username || r.id).join(', ');
        }
        const firstThree = receivers.slice(0, 3).map((r) => r.username || r.id).join(', ');
        const remaining = receivers.length - 3;
        return `${firstThree}, +${remaining} người khác`;
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
                    onClick={() => handlePageChange(i)}
                >
                    {i + 1}
                </CPaginationItem>
            );
        }
        return pages;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">Quản lý thông báo</h3>
                <CButton color="primary" onClick={() => setModalVisible(true)}>
                    <CIcon icon={cilPlus} className="me-2" />
                    Tạo thông báo mới
                </CButton>
            </div>

            <CCard className="mb-4 shadow-sm border-0">
                <CCardHeader className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small">
                                Hiển thị{' '}
                                <strong>
                                    {currentPage * pageSize + 1} –{' '}
                                    {Math.min((currentPage + 1) * pageSize, totalElements)}
                                </strong>{' '}
                                trong <strong>{totalElements}</strong> thông báo
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small">Số bản ghi/trang:</span>
                            <select
                                className="form-select form-select-sm"
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                style={{ width: '80px' }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className="text-center py-5">
                            <CSpinner color="primary" />
                            <div className="mt-2 text-muted small">Đang tải dữ liệu...</div>
                        </div>
                    ) : (
                        <CTable hover responsive align="middle" className="mb-0 border">
                            <CTableHead color="light">
                                <CTableRow>
                                    <CTableHeaderCell style={{ width: '30%' }}>Nội dung</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '20%' }}>Người nhận</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '10%' }} className="text-center">Trạng thái</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '15%' }}>Người tạo</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '15%' }}>Ngày tạo</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '10%' }} className="text-center">Thao tác</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {notifications.length === 0 ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan="6" className="text-center text-muted py-4">
                                            Chưa có thông báo nào được tạo bởi Admin.
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : (
                                    notifications.map((noti) => (
                                        <CTableRow
                                            key={noti.id}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleViewDetail(noti)}
                                        >
                                            <CTableDataCell style={{ maxWidth: '250px' }}>
                                                <div
                                                    className="fw-semibold text-dark text-truncate"
                                                    style={{ maxWidth: '230px' }}
                                                    title={noti.content}
                                                >
                                                    {noti.content}
                                                </div>
                                                {noti.link && (
                                                    <small className="text-muted d-flex align-items-center gap-1">
                                                        <CIcon icon={cilLink} />
                                                        <span className="text-truncate" style={{ maxWidth: '150px' }}>{noti.link}</span>
                                                    </small>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <div className="small text-truncate" style={{ maxWidth: '180px' }} title={formatReceiversPreview(noti.receivers)}>
                                                    {formatReceiversPreview(noti.receivers)}
                                                </div>
                                                <small className="text-muted">
                                                    Tổng: {noti.receivers?.length || 0} người
                                                </small>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                {noti.read ? (
                                                    <CBadge color="success" shape="rounded-pill">Đã đọc</CBadge>
                                                ) : (
                                                    <CBadge color="danger" shape="rounded-pill">Chưa đọc</CBadge>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <div className="small fw-semibold">{noti.createdByUsername || noti.createdById || '—'}</div>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-muted small">
                                                {formatDate(noti.createdAt)}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <CButton
                                                        color="info"
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Xem chi tiết"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetail(noti);
                                                        }}
                                                    >
                                                        <CIcon icon={cilZoom} />
                                                    </CButton>
                                                    {!noti.read && (
                                                        <CButton
                                                            color="success"
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Đánh dấu đã đọc"
                                                            onClick={(e) => handleMarkAsRead(noti.id, e)}
                                                        >
                                                            <CIcon icon={cilCheckCircle} />
                                                        </CButton>
                                                    )}
                                                    <CButton
                                                        color="danger"
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Xóa thông báo"
                                                        onClick={(e) => handleDelete(noti.id, e)}
                                                    >
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                )}
                            </CTableBody>
                        </CTable>
                    )}

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-end mt-4">
                            <CPagination>
                                <CPaginationItem
                                    disabled={currentPage === 0}
                                    onClick={() => handlePageChange(0)}
                                >
                                    Đầu
                                </CPaginationItem>
                                <CPaginationItem
                                    disabled={currentPage === 0}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    Trước
                                </CPaginationItem>
                                {renderPaginationItems()}
                                <CPaginationItem
                                    disabled={currentPage === totalPages - 1}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    Sau
                                </CPaginationItem>
                                <CPaginationItem
                                    disabled={currentPage === totalPages - 1}
                                    onClick={() => handlePageChange(totalPages - 1)}
                                >
                                    Cuối
                                </CPaginationItem>
                            </CPagination>
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="text-center mt-1">
                            <small className="text-muted">
                                Trang {currentPage + 1} / {totalPages}
                            </small>
                        </div>
                    )}
                </CCardBody>
            </CCard>

            <CreateNotificationModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={handleModalSuccess}
            />

            <NotificationDetailModal
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                notification={selectedNotification}
            />
        </div>
    );
};

export default NotificationPage;
