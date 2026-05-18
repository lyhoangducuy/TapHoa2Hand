import React, { useState, useEffect } from 'react';
import styles from './ReportAdminPage.module.scss';
import ReportTable from './ReportTable/ReportTable';
import ReportDetailModal from './ReportDetailModal';
import { getAllReports } from '../../../services/reportAdminService';

const ReportAdminPage = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

    // Load all reports
    useEffect(() => {
        fetchReports();
    }, []);

    // Apply filters whenever filter values change
    useEffect(() => {
        applyFilters();
    }, [reports, statusFilter, dateFromFilter, dateToFilter, searchFilter]);

    const fetchReports = async () => {
        try {
            setIsLoading(true);

            const data = await getAllReports();

            // data đã là array
            setReports(Array.isArray(data) ? data : []);

        } catch (error) {
            console.error('Error fetching reports:', error);
            alert('Lỗi khi tải danh sách báo cáo');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...reports];

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(
                (r) => r.status?.name === statusFilter
            );
        }

        // Filter by date range
        if (dateFromFilter) {
            const fromDate = new Date(dateFromFilter);

            filtered = filtered.filter(
                (r) => new Date(r.createdAt) >= fromDate
            );
        }

        if (dateToFilter) {
            const toDate = new Date(dateToFilter);
            toDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter(
                (r) => new Date(r.createdAt) <= toDate
            );
        }

        // Filter by search
        if (searchFilter.trim()) {
            const search = searchFilter.toLowerCase();

            filtered = filtered.filter((r) => {
                return (
                    r.reason?.displayName
                        ?.toLowerCase()
                        .includes(search) ||

                    r.detail
                        ?.toLowerCase()
                        .includes(search) ||

                    r.reporterName
                        ?.toLowerCase()
                        .includes(search) ||

                    r.reportedUserName
                        ?.toLowerCase()
                        .includes(search) ||

                    r.postTitle
                        ?.toLowerCase()
                        .includes(search) ||

                    r.id
                        ?.toLowerCase()
                        .includes(search)
                );
            });
        }

        setFilteredReports(filtered);
    };

    const handleViewDetail = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedReport(null);
    };

    const handleStatusUpdate = async () => {
        await fetchReports();
        handleModalClose();
    };

    const handleResetFilters = () => {
        setStatusFilter('ALL');
        setDateFromFilter('');
        setDateToFilter('');
        setSearchFilter('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Quản lý báo cáo</h1>
                <p>
                    Xem, lọc và xử lý các báo cáo từ người dùng
                </p>
            </div>

            {/* Filter Section */}
            <div className={styles.filterSection}>
                <div className={styles.filterGroup}>

                    {/* Status Filter */}
                    <div className={styles.filterItem}>
                        <label>Trạng thái:</label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className={styles.filterInput}
                        >
                            <option value="ALL">
                                Tất cả
                            </option>

                            <option value="PENDING">
                                Chờ xử lý
                            </option>

                            <option value="APPROVED">
                                Đã duyệt
                            </option>

                            <option value="RESOLVED">
                                Đã xử lý
                            </option>

                            <option value="REJECTED">
                                Bị từ chối
                            </option>
                        </select>
                    </div>

                    {/* Date From */}
                    <div className={styles.filterItem}>
                        <label>Từ ngày:</label>

                        <input
                            type="date"
                            value={dateFromFilter}
                            onChange={(e) =>
                                setDateFromFilter(e.target.value)
                            }
                            className={styles.filterInput}
                        />
                    </div>

                    {/* Date To */}
                    <div className={styles.filterItem}>
                        <label>Đến ngày:</label>

                        <input
                            type="date"
                            value={dateToFilter}
                            onChange={(e) =>
                                setDateToFilter(e.target.value)
                            }
                            className={styles.filterInput}
                        />
                    </div>

                    {/* Search */}
                    <div className={styles.filterItem}>
                        <label>Tìm kiếm:</label>

                        <input
                            type="text"
                            placeholder="Lý do, người báo cáo, ID..."
                            value={searchFilter}
                            onChange={(e) =>
                                setSearchFilter(e.target.value)
                            }
                            className={styles.filterInput}
                        />
                    </div>

                    {/* Reset */}
                    <button
                        className={styles.resetBtn}
                        onClick={handleResetFilters}
                    >
                        Đặt lại
                    </button>
                </div>

                {/* Results */}
                <div className={styles.resultsInfo}>
                    <span>
                        Kết quả:{' '}
                        <strong>
                            {filteredReports.length}
                        </strong>{' '}
                        báo cáo
                    </span>
                </div>
            </div>

            {/* Report Table */}
            <ReportTable
                reports={filteredReports}
                onViewDetail={handleViewDetail}
                isLoading={isLoading}
            />

            {/* Detail Modal */}
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