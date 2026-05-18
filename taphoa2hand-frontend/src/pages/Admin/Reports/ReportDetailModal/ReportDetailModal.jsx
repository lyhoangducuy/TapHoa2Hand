import React, { useEffect, useState } from 'react';
import styles from './ReportDetailModal.module.scss';
import { updateReportStatus } from '../../../../services/reportAdminService';

const ReportDetailModal = ({
    report,
    isOpen,
    onClose,
    onStatusUpdate
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [newStatus, setNewStatus] = useState('PENDING');

    useEffect(() => {
        if (report?.status?.name) {
            setNewStatus(report.status.name);
        }
    }, [report]);

    if (!isOpen || !report) return null;

    const getValue = (value) => {
        if (value === null || value === undefined) {
            return '---';
        }

        if (typeof value === 'object') {
            return (
                value.displayName ||
                value.name ||
                JSON.stringify(value)
            );
        }

        return value;
    };

    const handleStatusUpdate = async () => {
        try {
            setIsLoading(true);

            await updateReportStatus(
                report.id,
                newStatus
            );

            alert('Cập nhật trạng thái thành công');

            onStatusUpdate && onStatusUpdate();

            onClose();
        } catch (error) {
            console.error(error);
            alert('Lỗi cập nhật trạng thái');
        } finally {
            setIsLoading(false);
        }
    };

    const getReportTypeLabel = (type) => {
        const types = {
            USER: 'Báo cáo người dùng',
            POST: 'Báo cáo bài đăng',
            ORDER: 'Báo cáo đơn hàng'
        };

        return types[type] || type;
    };

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Chờ xử lý',
            RESOLVED: 'Đã xử lý',
            REJECTED: 'Bị từ chối',
            APPROVED: 'Đã duyệt'
        };

        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: '#ffc107',
            APPROVED: '#0d6efd',
            RESOLVED: '#28a745',
            REJECTED: '#dc3545'
        };

        return colors[status] || '#6c757d';
    };

    return (
        <div
            className={styles.modal}
            onClick={onClose}
        >
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2>Chi tiết báo cáo</h2>

                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.body}>
                    {/* ID + TYPE */}
                    <div className={styles.section}>
                        <div className={styles.row}>
                            <div className={styles.col}>
                                <label>ID báo cáo:</label>

                                <p>{report.id}</p>
                            </div>

                            <div className={styles.col}>
                                <label>Loại báo cáo:</label>

                                <p className={styles.badge}>
                                    {getReportTypeLabel(
                                        report.type?.name
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* REASON */}
                    <div className={styles.section}>
                        <label>Lý do báo cáo:</label>

                        <div className={styles.reason}>
                            {getValue(report.reason)}
                        </div>
                    </div>

                    {/* DETAIL */}
                    <div className={styles.section}>
                        <label>Mô tả chi tiết:</label>

                        <div className={styles.reason}>
                            {getValue(report.detail)}
                        </div>
                    </div>

                    {/* REPORTER */}
                    <div className={styles.section}>
                        <label>Người báo cáo:</label>

                        <p>
                            {getValue(report.reporterName)}
                        </p>
                    </div>

                    {/* REPORTED USER */}
                    {report.reportedUserName && (
                        <div className={styles.section}>
                            <label>Người bị báo cáo:</label>

                            <p>
                                {getValue(
                                    report.reportedUserName
                                )}
                            </p>
                        </div>
                    )}

                    {/* POST */}
                    {report.postTitle && (
                        <div className={styles.section}>
                            <label>Bài đăng:</label>

                            <p>
                                {getValue(report.postTitle)}
                            </p>
                        </div>
                    )}

                    {/* ORDER */}
                    {report.orderId && (
                        <div className={styles.section}>
                            <label>Đơn hàng:</label>

                            <p>{getValue(report.orderId)}</p>
                        </div>
                    )}

                    {/* EVIDENCE */}
                    {report.evidences?.length > 0 && (
                        <div className={styles.section}>
                            <label>Hình minh chứng:</label>

                            <div
                                className={
                                    styles.evidenceGrid
                                }
                            >
                                {report.evidences.map(
                                    (evidence, idx) => {
                                        const imageUrl =
                                            evidence?.imageUrl ||
                                            evidence?.url;

                                        return (
                                            <a
                                                key={idx}
                                                href={imageUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={`Evidence ${idx}`}
                                                />
                                            </a>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}

                    {/* TIME */}
                    <div className={styles.section}>
                        <div className={styles.row}>
                            <div className={styles.col}>
                                <label>Ngày tạo:</label>

                                <p>
                                    {report.createdAt
                                        ? new Date(
                                              report.createdAt
                                          ).toLocaleString(
                                              'vi-VN'
                                          )
                                        : '---'}
                                </p>
                            </div>

                            <div className={styles.col}>
                                <label>
                                    Cập nhật lần cuối:
                                </label>

                                <p>
                                    {report.updatedAt
                                        ? new Date(
                                              report.updatedAt
                                          ).toLocaleString(
                                              'vi-VN'
                                          )
                                        : '---'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* STATUS */}
                    <div className={styles.section}>
                        <label>Trạng thái:</label>

                        <div
                            className={styles.statusControl}
                        >
                            <select
                                value={newStatus}
                                onChange={(e) =>
                                    setNewStatus(
                                        e.target.value
                                    )
                                }
                                className={
                                    styles.statusSelect
                                }
                            >
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

                            <span
                                className={
                                    styles.statusBadge
                                }
                                style={{
                                    backgroundColor:
                                        getStatusColor(
                                            newStatus
                                        )
                                }}
                            >
                                {getStatusLabel(
                                    newStatus
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.updateBtn}
                        onClick={handleStatusUpdate}
                        disabled={
                            isLoading ||
                            newStatus ===
                                report.status?.name
                        }
                    >
                        {isLoading
                            ? 'Đang cập nhật...'
                            : 'Cập nhật trạng thái'}
                    </button>

                    <button
                        className={styles.cancelBtn}
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailModal;