import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './MyOrderPage.module.scss';
import * as orderService from '../../../services/orderService';
import { FeedbackForm } from '../../../components/Feedback';
const cx = classNames.bind(styles);

const MyOrderPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'purchases'); // 'purchases' hoặc 'sales'
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [activeTab, pagination.page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = activeTab === 'purchases'
                ? await orderService.getPurchases(pagination.page, pagination.size)
                : await orderService.getSales(pagination.page, pagination.size);

            // Backend trả về ApiResponse với result chứa Page
            const pageData = response.data?.result;
            if (pageData) {
                setOrders(pageData.content || []);
                setPagination(prev => ({
                    ...prev,
                    totalElements: pageData.totalElements || 0,
                    totalPages: pageData.totalPages || 0
                }));
            } else {
                setOrders(response.data?.result || []);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatusPost(orderId, newStatus);
            toast.success("Cập nhật trạng thái thành công");
            fetchOrders();
        } catch (error) {
            toast.error("Có lỗi xảy ra  khi cập nhật");
        }
    };

    const handleFeedbackClick = (order) => {
        setSelectedOrder(order);
        setShowFeedbackForm(true);
    };

    const handleFeedbackSuccess = (feedback) => {
        setShowFeedbackForm(false);
        setSelectedOrder(null);
        toast.success('Đánh giá đã được gửi!');
        // Có thể refresh orders nếu muốn cập nhật UI
    };

    const handleFeedbackCancel = () => {
        setShowFeedbackForm(false);
        setSelectedOrder(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <>
            <div className={cx('my-order-wrapper')}>
                <h2 className={cx('page-title')}>Quản lý đơn hàng</h2>

                <div className={cx('order-tabs')}>
                    <div
                        className={cx('tab-item', { active: activeTab === 'purchases' })}
                        onClick={() => { setActiveTab('purchases'); setPagination(prev => ({ ...prev, page: 0 })); }}
                    >
                        🛒 Đơn mua
                    </div>
                    <div
                        className={cx('tab-item', { active: activeTab === 'sales' })}
                        onClick={() => { setActiveTab('sales'); setPagination(prev => ({ ...prev, page: 0 })); }}
                    >
                        💰 Đơn bán
                    </div>
                </div>

                {loading ? (
                    <div className={cx('loading-state')}>Đang tải dữ liệu...</div>
                ) : (
                    <div className={cx('order-list')}>
                        {orders.length === 0 ? (
                            <div className={cx('empty-state')}>

                                <p>Chưa có đơn hàng nào ở mục này.</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className={cx('order-card')}>
                                    <div className={cx('order-header')}>
                                        <div className={cx('order-info')}>
                                            <span className={cx('label')}>Mã đơn:</span>
                                            <span className={cx('value')}>#{order.id?.substring(0, 8).toUpperCase()}</span>
                                        </div>
                                        <div className={cx('order-status-badge', order.status?.name?.toLowerCase())}>
                                            {order.status?.displayName}
                                        </div>
                                    </div>

                                    <div className={cx('order-body')}>
                                        <div className={cx('product-info')}>
                                            <div className={cx('receiver-name')}>{order.receiverName}</div>
                                            <div className={cx('receiver-detail')}>
                                                <p>📞 {order.receiverPhone}</p>
                                                <p>📍 {order.shippingAddress}</p>
                                            </div>
                                        </div>

                                        <div className={cx('payment-info')}>
                                            <div className={cx('method-tag', order.paymentMethod)}>
                                                {order.paymentMethod === 'MIDDLEMAN' ? '🛡️ Trung gian' : '🤝 Trực tiếp'}
                                            </div>
                                            <div className={cx('total-amount')}>
                                                {formatCurrency(order.totalAmount)}
                                            </div>
                                            {order.platformFee > 0 && (
                                                <div className={cx('fee')}>Phí: {formatCurrency(order.platformFee)}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={cx('order-footer')}>
                                        <button
                                            className={cx('btn-detail')}
                                            onClick={() => navigate(`/order/myOrder/${order.id}`)}
                                        >
                                            Xem chi tiết
                                        </button>

                                        {activeTab === 'purchases' && order.status?.name === 'DELIVERED' && (
                                            <button
                                                className={cx('btn-feedback')}
                                                onClick={() => handleFeedbackClick(order)}
                                            >
                                                ⭐ Đánh giá
                                            </button>
                                        )}

                                        {activeTab === 'sales' && order.status?.name === 'PENDING' && (
                                            <div className={cx('seller-actions')}>
                                                <button
                                                    className={cx('btn-reject')}
                                                    onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                                >
                                                    Từ chối
                                                </button>
                                                <button
                                                    className={cx('btn-approve')}
                                                    onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                                                >
                                                    Xác nhận đơn
                                                </button>
                                            </div>
                                        )}

                                        {activeTab === 'sales' && order.status?.name === 'CONFIRMED' && (
                                            <button
                                                className={cx('btn-deliver')}
                                                onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                            >
                                                📦 Chuyển sang giao hàng thành công
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Phân trang */}
                {pagination.totalPages > 1 && (
                    <div className={cx('pagination')}>
                        <button
                            className={cx('page-btn')}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 0}
                        >
                            ← Trước
                        </button>
                        <span className={cx('page-info')}>
                            Trang {pagination.page + 1} / {pagination.totalPages}
                        </span>
                        <button
                            className={cx('page-btn')}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages - 1}
                        >
                            Sau →
                        </button>
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            {showFeedbackForm && selectedOrder && (
                <div className={cx('feedback-modal-overlay')} onClick={handleFeedbackCancel}>
                    <div className={cx('feedback-modal')} onClick={(e) => e.stopPropagation()}>
                        <FeedbackForm
                            orderId={selectedOrder.id}
                            targetUserName={`Đơn hàng #${selectedOrder.id?.substring(0, 8)}`}
                            onSuccess={handleFeedbackSuccess}
                            onCancel={handleFeedbackCancel}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default MyOrderPage;