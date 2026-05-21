import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLoader } from 'react-icons/fi';

import styles from './MyOrderPage.module.scss';
import * as orderService from '../../../services/orderService';
import { FeedbackPopup } from '../../../components/Feedback';
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
    const [paymentAmount, setPaymentAmount] = useState(0);

    useEffect(() => {
        if (newOrderId) {
            setActiveTab('purchases');
            setPagination((prev) => ({ ...prev, page: 0 }));
        }
    }, [newOrderId]);

    useEffect(() => {
        fetchOrders();
    }, [activeTab, pagination.page, selectedStatus, selectedPaymentMethod]);

    // Xử lý Callback từ VNPay
    useEffect(() => {
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef'); // Lấy mã đơn hàng từ URL VNPay

        if (vnp_ResponseCode && vnp_TxnRef) {
            if (vnp_ResponseCode === '00') {
                // Thanh toán thành công -> Gọi hàm cập nhật trạng thái
                handleUpdateStatus(vnp_TxnRef, 'PAID_WAITING_PICKUP', 'VNPAY');
            } else {
                toast.error('Thanh toán VNPay thất bại hoặc đã bị hủy giao dịch.');
            }

            // Dọn dẹp URL để người dùng F5 không bị gọi lại
            const newSearchParams = new URLSearchParams(searchParams);
            const vnpParamsToRemove = [
                'vnp_Amount', 'vnp_BankCode', 'vnp_BankTranNo', 'vnp_CardType',
                'vnp_OrderInfo', 'vnp_PayDate', 'vnp_ResponseCode', 'vnp_TmnCode',
                'vnp_TransactionNo', 'vnp_TransactionStatus', 'vnp_TxnRef', 'vnp_SecureHash'
            ];
            
            vnpParamsToRemove.forEach(param => newSearchParams.delete(param));
            window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const statusParam = selectedStatus && selectedStatus !== 'ALL' ? selectedStatus : undefined;
            const paymentParam = selectedPaymentMethod && selectedPaymentMethod !== 'ALL' ? selectedPaymentMethod : undefined;
            const response = activeTab === 'purchases'
                ? await orderService.getPurchases(pagination.page, pagination.size, statusParam, paymentParam)
                : await orderService.getSales(pagination.page, pagination.size, statusParam, paymentParam);

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

    /** Số tài khoản: chỉ chữ số. Tên ngân hàng / chủ TK: không cho nhập số (mọi ký tự số Unicode). */
    const handleSellerBankChange = (e) => {
        const { name, value } = e.target;
        let next = value;
        if (name === 'accountNumber') {
            next = value.replace(/\D/g, '');
        } else if (name === 'bankName' || name === 'accountName') {
            next = value.replace(/\p{Nd}/gu, '');
        }
        setSellerBankForm((prev) => ({ ...prev, [name]: next }));
    };

    const handleConfirmSellerBank = async () => {
        const bankName = sellerBankForm.bankName?.trim() ?? '';
        const accountName = sellerBankForm.accountName?.trim() ?? '';
        const accountNumber = sellerBankForm.accountNumber?.trim() ?? '';
        if (!bankName || !accountName || !accountNumber) {
            toast.warning('Vui lòng nhập đầy đủ thông tin ngân hàng');
            return;
        }
        if (/\p{Nd}/u.test(bankName)) {
            toast.warning('Tên ngân hàng không được chứa chữ số');
            return;
        }
        if (/\p{Nd}/u.test(accountName)) {
            toast.warning('Họ tên chủ tài khoản không được chứa chữ số');
            return;
        }
        if (!/^\d+$/.test(accountNumber)) {
            toast.warning('Số tài khoản chỉ được nhập chữ số (0–9)');
            return;
        }
        try {
            setActionLoading(true);
            await orderService.updateOrderStatus(confirmOrderId, 'CONFIRMED', {
                bankName,
                accountName,
                accountNumber,
            });
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
        const orderToPay = orders.find((o) => o.id === orderId);
        setPaymentOrderId(orderId);
        setPaymentAmount(orderToPay ? orderToPay.totalAmount : 0);
        setShowPaymentModal(true);
    };



    const handlePaymentCancel = () => {
        setShowPaymentModal(false);
        setPaymentOrderId(null);
        setPaymentAmount(0);
    };

    const handlePaymentConfirmed = (orderId) => {
        handleUpdateStatus(orderId, 'PAID_WAITING_PICKUP');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

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
                                        onConfirmDelivery={(orderId) => handleUpdateStatus(orderId, 'SETTLING')}
                                        onReportSuccess={fetchOrders}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                )}

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

            {showFeedbackForm && selectedOrder && (
                <FeedbackPopup
                    order={selectedOrder}
                    onSuccess={handleFeedbackSuccess}
                    onCancel={handleFeedbackCancel}
                />
            )}

            <SellerBankModal
                show={showSellerBankModal}
                bankInfo={sellerBankForm}
                onBankInfoChange={handleSellerBankChange}
                onConfirm={handleConfirmSellerBank}
                onCancel={() => setShowSellerBankModal(false)}
                loading={actionLoading}
            />

            <PaymentModal
                show={showPaymentModal}
                orderId={paymentOrderId}
                amount={paymentAmount}
                onCancel={handlePaymentCancel}
            />
        </>
    );
};

export default MyOrderPage;