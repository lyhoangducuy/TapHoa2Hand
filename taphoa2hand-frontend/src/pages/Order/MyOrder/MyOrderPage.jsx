import React, { useEffect, useMemo, useState } from 'react';
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
    const newOrderId = searchParams.get('orderId');
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'purchases'); // 'purchases' hoặc 'sales'
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

    /** Gom đơn theo tin đăng (đơn mua / đơn bán): trong mỗi tin sắp đơn theo thời gian tạo (cũ → mới), nhóm tin theo đơn mới nhất */
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

    const renderOrderCard = (order) => (
        <div key={order.id} className={cx('order-card', { highlighted: order.id === newOrderId })}>
            <div className={cx('order-header')}>
                <div className={cx('order-info')}>
                    <span className={cx('label')}>Mã đơn:</span>
                    <span className={cx('value')}>#{order.id?.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className={cx('order-status-badge', order.status?.name?.toLowerCase())}>
                    {order.status?.displayName}
                </div>
            </div>

            {activeTab === 'sales' && order.buyerUsername && (
                <div className={cx('buyer-row')}>
                    <span className={cx('label')}>Người mua:</span>
                    <span className={cx('value')}>@{order.buyerUsername}</span>
                </div>
            )}

            <div className={cx('order-body')}>
                <div className={cx('product-info')}>
                    <div className={cx('receiver-name')}>{order.receiverName}</div>
                    <div className={cx('receiver-detail')}>
                        <p>📞 {order.receiverPhone}</p>
                        <p>📍 {order.shippingAddress}</p>
                    </div>
                </div>

                <div className={cx('payment-info')}>
                    <div className={cx('method-tag', order.paymentMethod?.name)}>
                        {order.paymentMethod?.name === 'MIDDLEMAN' ? '🛡️ Trung gian' : '🤝 Trực tiếp'}
                    </div>
                    {order.paymentMethod?.name === 'MIDDLEMAN' &&
                        order.holdDurationAmount != null &&
                        order.holdDurationUnit && (
                        <div className={cx('escrow-hold')}>
                            Giữ tiền:{' '}
                            {order.holdDurationUnit === 'HOURS'
                                ? `${order.holdDurationAmount} giờ`
                                : `${order.holdDurationAmount} ngày`}
                            {order.status?.name === 'DELIVERED' && order.holdUntil && (
                                <span> — đến {new Date(order.holdUntil).toLocaleDateString('vi-VN')}</span>
                            )}
                        </div>
                    )}
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
                            disabled={actionLoading}
                        >
                            Từ chối
                        </button>
                        <button
                            className={cx('btn-approve')}
                            onClick={() => handleUpdateStatus(order.id, 'CONFIRMED', order.paymentMethod?.name)}
                            disabled={actionLoading}
                        >
                            {order.paymentMethod?.name === 'MIDDLEMAN' ? 'Chọn đơn + TK NH' : 'Chọn đơn này'}
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
    );

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

                {newOrderId && (
                    <div className={cx('new-order-banner')}>
                        Đã tạo đơn hàng mới #{newOrderId?.substring(0, 8)}. Vui lòng thanh toán trong 180 phút.
                    </div>
                )}
                <div className={cx('filter-row')}>
                    <label className={cx('filter-label')}>Trạng thái:</label>
                    <select className={cx('status-select')} value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPagination(prev => ({ ...prev, page: 0 })); }}>
                        <option value={'ALL'}>Tất cả</option>
                        <option value={'PENDING'}>Chờ xác nhận</option>
                        <option value={'CONFIRMED'}>Đã xác nhận</option>
                        <option value={'SHIPPING'}>Đang giao</option>
                        <option value={'DELIVERED'}>Đã giao</option>
                        <option value={'CANCELLED'}>Đã hủy</option>
                        <option value={'RETURNED'}>Trả hàng</option>
                    </select>

                    <label className={cx('filter-label')}>Thanh toán:</label>
                    <select className={cx('status-select')} value={selectedPaymentMethod} onChange={(e) => { setSelectedPaymentMethod(e.target.value); setPagination(prev => ({ ...prev, page: 0 })); }}>
                        <option value={'ALL'}>Tất cả</option>
                        <option value={'DIRECT'}>Trực tiếp</option>
                        <option value={'MIDDLEMAN'}>Trung gian</option>
                    </select>
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
                            <>
                                <div className={cx('sales-group-hint')}>
                                    {activeTab === 'sales' ? (
                                        <>
                                            Mỗi tin đăng có thể nhận nhiều yêu cầu. Đơn được sắp theo thời gian tạo. Khi bạn{' '}
                                            <strong>chọn một đơn</strong>, các đơn chờ khác cùng tin sẽ tự động hủy.
                                        </>
                                    ) : (
                                        <>
                                            Đơn mua được gom theo <strong>tin đăng</strong>. Trong mỗi tin, đơn xếp theo thời gian tạo (cũ đến mới).
                                        </>
                                    )}
                                </div>
                                {postOrderGroups.map((group) => (
                                    <div key={group.groupKey} className={cx('post-order-group')}>
                                        <div className={cx('post-group-header')}>
                                            {group.postImageUrl ? (
                                                <img
                                                    className={cx('post-thumb')}
                                                    src={group.postImageUrl}
                                                    alt=""
                                                />
                                            ) : (
                                                <div className={cx('post-thumb', 'placeholder')}>📦</div>
                                            )}
                                            <div className={cx('post-group-meta')}>
                                                <h3 className={cx('post-group-title')}>
                                                    {group.postTitle || 'Tin đăng'}
                                                </h3>
                                                <p className={cx('post-group-sub')}>
                                                    {group.orders.length} đơn — thứ tự theo lúc tạo
                                                </p>
                                            </div>
                                        </div>
                                        <div className={cx('post-group-orders')}>
                                            {group.orders.map((order) => renderOrderCard(order))}
                                        </div>
                                    </div>
                                ))}
                            </>
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

            {showSellerBankModal && (
                <div className={cx('feedback-modal-overlay')} onClick={() => setShowSellerBankModal(false)}>
                    <div className={cx('feedback-modal')} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '20px', color: '#2f3542', fontSize: '18px', fontWeight: '700' }}>
                            Nhập thông tin ngân hàng
                        </h3>
                        <div className={cx('form-section')}>
                            <input
                                type="text"
                                name="bankName"
                                value={sellerBankForm.bankName}
                                onChange={handleSellerBankChange}
                                placeholder="Tên ngân hàng"
                            />
                            <input
                                type="text"
                                name="accountName"
                                value={sellerBankForm.accountName}
                                onChange={handleSellerBankChange}
                                placeholder="Tên chủ tài khoản"
                            />
                            <input
                                type="text"
                                name="accountNumber"
                                value={sellerBankForm.accountNumber}
                                onChange={handleSellerBankChange}
                                placeholder="Số tài khoản"
                            />
                        </div>
                        <div className={cx('modal-actions')}>
                            <button
                                className={cx('btn', 'btn-cancel')}
                                onClick={() => setShowSellerBankModal(false)}
                                disabled={actionLoading}
                            >
                                Hủy
                            </button>
                            <button
                                className={cx('btn', 'btn-primary')}
                                onClick={handleConfirmSellerBank}
                                disabled={actionLoading}
                            >
                                {actionLoading ? '⏳ Đang xử lý...' : 'Xác nhận đơn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyOrderPage;