import React, { useState } from 'react';
import styles from './ReportDetailModal.module.scss';
import { updateReportStatus } from '../../../../services/reportAdminService';

const ReportDetailModal = ({ report, isOpen, onClose, onStatusUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [newStatus, setNewStatus] = useState(report?.status || 'PENDING');

    if (!isOpen || !report) return null;

    const handleStatusUpdate = async () => {
        try {
            setIsLoading(true);
            await updateReportStatus(report.id, newStatus);
            setNewStatus(newStatus);
            onStatusUpdate && onStatusUpdate();
            alert('Cập nhật trạng thái báo cáo thành công');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Lỗi khi cập nhật trạng thái');
        } finally {
            setIsLoading(false);
        }
    };

    const getReportTypeLabel = (type) => {
        const types = {
            USER: 'Báo cáo Người dùng',
            POST: 'Báo cáo Bài đăng',
            ORDER: 'Báo cáo Đơn hàng'
        };
        return types[type] || type;
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: '#ffc107',
            RESOLVED: '#28a745',
            REJECTED: '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Chờ xử lý',
            RESOLVED: 'Đã xử lý',
            REJECTED: 'Bị từ chối'
        };
        return labels[status] || status;
    };

    return (
        <div className={styles.modal} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Chi tiết báo cáo</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.body}>
                    {/* ID và loại báo cáo */}
                    <div className={styles.section}>
                        <div className={styles.row}>
                            <div className={styles.col}>
                                <label>ID báo cáo:</label>
                                <p>{report.id}</p>
                            </div>
                            <div className={styles.col}>
                                <label>Loại báo cáo:</label>
                                <p className={styles.badge}>{getReportTypeLabel(report.type)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung báo cáo */}
                    <div className={styles.section}>
                        <label>Nội dung báo cáo:</label>
                        <div className={styles.reason}>{report.reason}</div>
                    </div>

                    {/* Người báo cáo */}
                    <div className={styles.section}>
                        <div className={styles.row}>
                            <div className={styles.col}>
                                <label>Người báo cáo:</label>
                                <p>{report.reporterName} (ID: {report.reporterId})</p>
                            </div>
                        </div>
                    </div>

                    {/* Đối tượng bị báo cáo */}
                    {report.reportedUserName && (
                        <div className={styles.section}>
                            <label>Người bị báo cáo:</label>
                            <p>{report.reportedUserName} (ID: {report.reportedUserId})</p>
                        </div>
                    )}

                    {/* Bài đăng bị báo cáo */}
                    {report.postTitle && (
                        <div className={styles.section}>
                            <label>Bài đăng:</label>
                            <p>{report.postTitle} (ID: {report.postId})</p>
                        </div>
                    )}

                    {/* Đơn hàng bị báo cáo */}
                    {report.orderId && (
                        <div className={styles.section}>
                            <label>Đơn hàng:</label>
                            <p>ID: {report.orderId}</p>
                        </div>
                    )}

                    {/* Hình ảnh minh chứng */}
                    {report.evidences && report.evidences.length > 0 && (
                        <div className={styles.section}>
                            <label>Hình ảnh minh chứng:</label>
                            <div className={styles.evidenceGrid}>
                                {report.evidences.map((evidence, idx) => (
                                    <a key={idx} href={evidence.imageUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={evidence.imageUrl} alt={`Evidence ${idx + 1}`} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Thời gian */}
                    <div className={styles.section}>
                        <div className={styles.row}>
                            <div className={styles.col}>
                                <label>Ngày tạo:</label>
                                <p>{new Date(report.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className={styles.col}>
                                <label>Cập nhật lần cuối:</label>
                                <p>{new Date(report.updatedAt).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Trạng thái */}
                    <div className={styles.section}>
                        <label>Trạng thái:</label>
                        <div className={styles.statusControl}>
                            <select 
                                value={newStatus} 
                                onChange={(e) => setNewStatus(e.target.value)}
                                className={styles.statusSelect}
                            >
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="RESOLVED">Đã xử lý</option>
                                <option value="REJECTED">Bị từ chối</option>
                            </select>
                            <span 
                                className={styles.statusBadge}
                                style={{ backgroundColor: getStatusColor(newStatus) }}
                            >
                                {getStatusLabel(newStatus)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button 
                        className={styles.updateBtn} 
                        onClick={handleStatusUpdate}
                        disabled={isLoading || newStatus === report.status}
                    >
                        {isLoading ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                    </button>
                    <button className={styles.cancelBtn} onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailModal;
