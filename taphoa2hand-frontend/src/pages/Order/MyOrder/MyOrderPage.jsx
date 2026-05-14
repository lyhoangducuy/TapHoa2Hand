import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLoader } from 'react-icons/fi';

import styles from './MyOrderPage.module.scss';
import * as orderService from '../../../services/orderService';
import { FeedbackForm } from '../../../components/Feedback';
import {
    PaymentModal,
    SellerBankModal,
    OrderCard,
    OrderFilters,
    OrderTabs,
    PostOrderGroup
} from './components';

const cx = classNames.bind(styles);

const MyOrderPage = () => {
    const [searchParams] = useSearchParams();
    const newOrderId = searchParams.get('orderId');
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'purchases');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ALL');
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showSellerBankModal, setShowSellerBankModal] = useState(false);
    const [confirmOrderId, setConfirmOrderId] = useState(null);
    const [sellerBankForm, setSellerBankForm] = useState({ bankName: '', accountName: '', accountNumber: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentOrderId, setPaymentOrderId] = useState(null);

    useEffect(() => {
        if (newOrderId) {
            setActiveTab('purchases');
            setPagination((prev) => ({ ...prev, page: 0 }));
        }
    }, [newOrderId]);

    useEffect(() => {
        fetchOrders();
    }, [activeTab, pagination.page, selectedStatus, selectedPaymentMethod]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const statusParam = selectedStatus && selectedStatus !== 'ALL' ? selectedStatus : undefined;
            const paymentParam = selectedPaymentMethod && selectedPaymentMethod !== 'ALL' ? selectedPaymentMethod : undefined;
            const response = activeTab === 'purchases'
                ? await orderService.getPurchases(pagination.page, pagination.size, statusParam, paymentParam)
                : await orderService.getSales(pagination.page, pagination.size, statusParam, paymentParam);

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

    const handleSellerBankChange = (e) => {
        const { name, value } = e.target;
        setSellerBankForm(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmSellerBank = async () => {
        const { bankName, accountName, accountNumber } = sellerBankForm;
        if (!bankName || !accountName || !accountNumber) {
            toast.warning('Vui lòng nhập đầy đủ thông tin ngân hàng');
            return;
        }
        try {
            setActionLoading(true);
            await orderService.updateOrderStatus(confirmOrderId, 'CONFIRMED', sellerBankForm);
            toast.success('Đã chốt đơn. Các yêu cầu khác cùng tin đăng đã được hủy.');
            setShowSellerBankModal(false);
            setConfirmOrderId(null);
            setSellerBankForm({ bankName: '', accountName: '', accountNumber: '' });
            fetchOrders();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xác nhận đơn');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus, paymentMethod) => {
        if (newStatus === 'CONFIRMED' && paymentMethod === 'MIDDLEMAN') {
            setConfirmOrderId(orderId);
            setSellerBankForm({ bankName: '', accountName: '', accountNumber: '' });
            setShowSellerBankModal(true);
            return;
        }

        try {
            setActionLoading(true);
            await orderService.updateOrderStatus(orderId, newStatus);
            if (activeTab === 'sales' && newStatus === 'CONFIRMED') {
                toast.success('Đã chốt đơn. Các yêu cầu khác cùng tin đăng đã được hủy.');
            } else {
                toast.success('Cập nhật trạng thái thành công');
            }
            fetchOrders();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật");
        } finally {
            setActionLoading(false);
        }
    };

    const handleFeedbackClick = (order) => {
        setSelectedOrder(order);
        setShowFeedbackForm(true);
    };

    const handleFeedbackSuccess = () => {
        setShowFeedbackForm(false);
        setSelectedOrder(null);
        toast.success('Đánh giá đã được gửi!');
    };

    const handleFeedbackCancel = () => {
        setShowFeedbackForm(false);
        setSelectedOrder(null);
    };

    const handlePaymentClick = (orderId) => {
        setPaymentOrderId(orderId);
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async () => {
        try {
            setActionLoading(true);
            await orderService.confirmPayment(paymentOrderId);
            toast.success('Xác nhận thanh toán thành công! Chờ người bán lấy hàng.');
            setShowPaymentModal(false);
            setPaymentOrderId(null);
            fetchOrders();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePaymentCancel = () => {
        setShowPaymentModal(false);
        setPaymentOrderId(null);
    };

    const handlePaymentConfirmed = (orderId) => {
        handleUpdateStatus(orderId, 'PAID_WAITING_PICKUP');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Gom đơn theo tin đăng
    const postOrderGroups = useMemo(() => {
        if (!orders.length) return [];
        const map = new Map();
        for (const order of orders) {
            const pid = order.postId || `_unknown_${order.id}`;
            if (!map.has(pid)) {
                map.set(pid, {
                    groupKey: pid,
                    postId: order.postId,
                    postTitle: order.postTitle,
                    postImageUrl: order.postImageUrl,
                    orders: [],
                });
            }
            map.get(pid).orders.push(order);
        }
        const groups = [...map.values()];
        for (const g of groups) {
            g.orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        groups.sort((a, b) => {
            const t = (xs) =>
                Math.max(0, ...xs.map((o) => (o.createdAt ? new Date(o.createdAt).getTime() : 0)));
            return t(b.orders) - t(a.orders);
        });
        return groups;
    }, [orders]);

    return (
        <>
            <div className={cx('my-order-wrapper')}>
                <h2 className={cx('page-title')}>Quản lý đơn hàng</h2>

                <OrderTabs 
                    activeTab={activeTab} 
                    onTabChange={(tab) => {
                        setActiveTab(tab);
                        setPagination(prev => ({ ...prev, page: 0 }));
                    }}
                />

                <OrderFilters 
                    selectedStatus={selectedStatus}
                    selectedPaymentMethod={selectedPaymentMethod}
                    onStatusChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setPagination(prev => ({ ...prev, page: 0 }));
                    }}
                    onPaymentChange={(e) => {
                        setSelectedPaymentMethod(e.target.value);
                        setPagination(prev => ({ ...prev, page: 0 }));
                    }}
                />

                {loading ? (
                    <div className={cx('loading-state')}>
                        <FiLoader size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <div className={cx('order-list')}>
                        {orders.length === 0 ? (
                            <div className={cx('empty-state')}>
                                <p>Chưa có đơn hàng nào ở mục này.</p>
                            </div>
                        ) : (
                            <>
                                <div className={cx('sales-group-hint')}>
                                    {activeTab === 'sales' ? (
                                        <>
                                            Mỗi tin đăng có thể nhận nhiều yêu cầu — mỗi tin chỉ hiện sẵn hai đơn đầu, bấm{' '}
                                            <strong>Xem thêm</strong> để mở hết. Bạn có thể{' '}
                                            <strong>sắp xếp theo giá</strong> hoặc <strong>gõ một phần SĐT</strong> để lọc. Khi bạn{' '}
                                            <strong>chọn một đơn</strong>, các đơn chờ khác cùng tin sẽ tự động hủy.
                                        </>
                                    ) : (
                                        <>
                                            Đơn mua được gom theo <strong>tin đăng</strong> (mỗi tin hiện hai đơn đầu, có nút{' '}
                                            <strong>Xem thêm</strong>). Sắp xếp theo thời gian/giá hoặc lọc theo SĐT (một phần số).
                                        </>
                                    )}
                                </div>
                                {postOrderGroups.map((group) => (
                                    <PostOrderGroup
                                        key={group.groupKey}
                                        group={group}
                                        activeTab={activeTab}
                                        onFeedback={handleFeedbackClick}
                                        onPayment={handlePaymentClick}
                                        onReject={(orderId) => handleUpdateStatus(orderId, 'CANCELLED')}
                                        onApprove={(orderId, paymentMethod) => handleUpdateStatus(orderId, 'CONFIRMED', paymentMethod)}
                                        onPaymentConfirmed={handlePaymentConfirmed}
                                        onShipping={(orderId) => handleUpdateStatus(orderId, 'SHIPPING')}
                                        onDelivered={(orderId) => handleUpdateStatus(orderId, 'DELIVERED')}
                                        actionLoading={actionLoading}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Phân trang — luôn hiện khi có ≥1 trang (kể cả chỉ 1 trang) */}
                {!loading && pagination.totalPages >= 1 && (
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

            {/* Seller Bank Modal */}
            <SellerBankModal
                show={showSellerBankModal}
                bankInfo={sellerBankForm}
                onBankInfoChange={handleSellerBankChange}
                onConfirm={handleConfirmSellerBank}
                onCancel={() => setShowSellerBankModal(false)}
                loading={actionLoading}
            />

            {/* Payment Modal */}
            <PaymentModal
                show={showPaymentModal}
                orderId={paymentOrderId}
                onConfirm={handleConfirmPayment}
                onCancel={handlePaymentCancel}
                loading={actionLoading}
            />
        </>
    );
};

export default MyOrderPage;