import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import {
    CCard, CCardBody, CCardHeader,
    CButton, CFormInput, CFormSelect,
    CInputGroup, CInputGroupText,
    CPagination, CPaginationItem, CSpinner,
    CBadge, CTable, CTableHead, CTableRow,
    CTableHeaderCell, CTableBody, CTableDataCell,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilFilter, cilSearch } from '@coreui/icons';

import ReportTable from './ReportTable/ReportTable';
import ReportDetailModal from './ReportDetailModal';
import { getAllReports } from '../../../services/reportAdminService';
import styles from './ReportAdminPage.module.scss';

const cx = classNames.bind(styles);

const REPORT_TYPES = [
    { value: 'ALL', label: 'Tất cả loại' },
    { value: 'USER', label: 'Người dùng' },
    { value: 'POST', label: 'Bài đăng' },
    { value: 'ORDER', label: 'Đơn hàng' },
];

const REPORT_STATUSES = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'PROCESSED', label: 'Đã xử lý' },
    { value: 'REJECTED', label: 'Bị từ chối' },
];

const ReportAdminPage = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [reports, statusFilter, typeFilter, dateFromFilter, dateToFilter, searchFilter, currentPage]);

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const data = await getAllReports();
            setReports(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...reports];

        if (typeFilter !== 'ALL') {
            filtered = filtered.filter((r) => r.type?.name === typeFilter);
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((r) => r.status?.name === statusFilter);
        }

        if (dateFromFilter) {
            const fromDate = new Date(dateFromFilter);
            filtered = filtered.filter((r) => new Date(r.createdAt) >= fromDate);
        }

        if (dateToFilter) {
            const toDate = new Date(dateToFilter);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((r) => new Date(r.createdAt) <= toDate);
        }

        if (searchFilter.trim()) {
            const search = searchFilter.toLowerCase();
            filtered = filtered.filter((r) =>
                r.reason?.displayName?.toLowerCase().includes(search) ||
                r.detail?.toLowerCase().includes(search) ||
                r.reporterName?.toLowerCase().includes(search) ||
                r.reportedUserName?.toLowerCase().includes(search) ||
                r.postTitle?.toLowerCase().includes(search) ||
                r.id?.toLowerCase().includes(search)
            );
        }

        setFilteredReports(filtered);
        setTotalElements(filtered.length);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    };

    const handleViewDetail = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedReport(null);
    };

    const handleStatusUpdate = () => {
        fetchReports();
        handleModalClose();
    };

    const handleResetFilters = () => {
        setStatusFilter('ALL');
        setTypeFilter('ALL');
        setDateFromFilter('');
        setDateToFilter('');
        setSearchFilter('');
        setCurrentPage(0);
    };

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(0);
    };

    const paginatedReports = filteredReports.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    const renderPaginationItems = () => {
        const items = [];
        const windowSize = 5;
        let start = Math.max(0, currentPage - Math.floor(windowSize / 2));
        let end = Math.min(totalPages, start + windowSize);
        start = Math.max(0, end - windowSize);
        for (let i = start; i < end; i++) {
            items.push(
                <CPaginationItem
                    key={i}
                    active={i === currentPage}
                    onClick={() => setCurrentPage(i)}
                >
                    {i + 1}
                </CPaginationItem>
            );
        }
        return items;
    };

    return (
        <div className={cx('report-page')}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">Quản lý báo cáo</h3>
                <CInputGroup style={{ maxWidth: '320px' }}>
                    <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                    <CFormInput
                        placeholder="Tìm kiếm (ID, lý do, người báo cáo)..."
                        value={searchFilter}
                        onChange={(e) => {
                            setSearchFilter(e.target.value);
                            setCurrentPage(0);
                        }}
                    />
                    {searchFilter && (
                        <CButton color="secondary" variant="outline" onClick={() => { setSearchFilter(''); setCurrentPage(0); }}>
                            ✕
                        </CButton>
                    )}
                </CInputGroup>
            </div>

            <CCard className="mb-4 shadow-sm border-0">
                <CCardHeader className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2 flex-wrap align-items-center">
                            <CFormSelect
                                size="sm"
                                style={{ width: '160px' }}
                                value={statusFilter}
                                onChange={handleFilterChange(setStatusFilter)}
                            >
                                {REPORT_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </CFormSelect>
                            <CFormSelect
                                size="sm"
                                style={{ width: '150px' }}
                                value={typeFilter}
                                onChange={handleFilterChange(setTypeFilter)}
                            >
                                {REPORT_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </CFormSelect>
                            <CFormInput
                                type="date"
                                size="sm"
                                style={{ width: '140px' }}
                                value={dateFromFilter}
                                onChange={handleFilterChange(setDateFromFilter)}
                                title="Từ ngày"
                            />
                            <CFormInput
                                type="date"
                                size="sm"
                                style={{ width: '140px' }}
                                value={dateToFilter}
                                onChange={handleFilterChange(setDateToFilter)}
                                title="Đến ngày"
                            />
                            <CButton
                                color="secondary"
                                variant="outline"
                                size="sm"
                                onClick={handleResetFilters}
                                title="Đặt lại bộ lọc"
                            >
                                <CIcon icon={cilFilter} className="me-1" /> Đặt lại
                            </CButton>
                        </div>
                        <small className="text-muted">
                            Kết quả: <strong>{totalElements}</strong> báo cáo
                        </small>
                    </div>
                </CCardHeader>
                <CCardBody>
                    {isLoading ? (
                        <div className="text-center py-5">
                            <CSpinner color="primary" />
                            <div className="mt-2 text-muted small">Đang tải dữ liệu...</div>
                        </div>
                    ) : (
                        <>
                            <ReportTable
                                reports={paginatedReports}
                                onViewDetail={handleViewDetail}
                            />
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
                                    <small className="text-muted">
                                        Trang {currentPage + 1} / {totalPages}
                                    </small>
                                </div>
                            )}
                        </>
                    )}
                </CCardBody>
            </CCard>

            <ReportDetailModal
                report={selectedReport}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onStatusUpdate={handleStatusUpdate}
            />
        </div>
    );
};

export default ReportAdminPage;
