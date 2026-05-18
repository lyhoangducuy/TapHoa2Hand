import React from 'react';
import styles from './ReportTable.module.scss';

const ReportTable = ({ reports, onViewDetail, isLoading }) => {

    const getReportTypeLabel = (type) => {
        const types = {
            USER: 'Người dùng',
            POST: 'Bài đăng',
            ORDER: 'Đơn hàng'
        };

        return types[type] || type;
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'pending',
            APPROVED: 'approved',
            RESOLVED: 'resolved',
            REJECTED: 'rejected'
        };

        return colors[status] || 'default';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                Đang tải dữ liệu...
            </div>
        );
    }

    if (!reports || reports.length === 0) {
        return (
            <div className={styles.empty}>
                Không có báo cáo nào
            </div>
        );
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Loại</th>
                        <th>Lý do</th>
                        <th>Người báo cáo</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {reports.map((report) => (
                        <tr key={report.id}>
                            
                            {/* ID */}
                            <td className={styles.idCell}>
                                <span className={styles.id}>
                                    {report.id?.substring(0, 8)}...
                                </span>
                            </td>

                            {/* Type */}
                            <td>
                                <span className={styles.badge}>
                                    {getReportTypeLabel(report.type?.name)}
                                </span>
                            </td>

                            {/* Reason */}
                            <td className={styles.reasonCell}>
                                <div className={styles.reason}>
                                    {report.reason?.displayName}
                                </div>
                            </td>

                            {/* Reporter */}
                            <td className={styles.nameCell}>
                                {report.reporterName}
                            </td>

                            {/* Status */}
                            <td>
                                <span
                                    className={`${styles.status} ${
                                        styles[
                                            getStatusColor(
                                                report.status?.name
                                            )
                                        ]
                                    }`}
                                >
                                    {report.status?.displayName}
                                </span>
                            </td>

                            {/* Created At */}
                            <td className={styles.dateCell}>
                                {formatDate(report.createdAt)}
                            </td>

                            {/* Actions */}
                            <td className={styles.actionCell}>
                                <button
                                    className={styles.viewBtn}
                                    onClick={() =>
                                        onViewDetail(report)
                                    }
                                >
                                    Xem chi tiết
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportTable;