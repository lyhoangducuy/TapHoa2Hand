import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { 
    FiEye, 
    FiStar, 
    FiX, 
    FiCheck, 
    FiCreditCard, 
    FiPackage, 
    FiCheckCircle,
    FiFlag
} from 'react-icons/fi';
import { getToken } from '../../../../services/localStorageService';
import ReportModal from '../../../../components/Report/ReportModal';
import styles from '../MyOrderPage.module.scss';

const cx = classNames.bind(styles);

const OrderCard = ({ 
    order, 
    activeTab,
    onFeedback,
    onPayment,
    onReject,
    onApprove,
    onPaymentConfirmed,
    onShipping,
    onDelivered,
    actionLoading
}) => {
    const navigate = useNavigate();
    const [reportOpen, setReportOpen] = useState(false);
    const hasToken = Boolean(getToken());
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className={cx('order-card')}>
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
                    <FiEye size={18} />
                    Xem chi tiết
                </button>

                {hasToken ? (
                    <button
                        type="button"
                        className={cx('btn-report')}
                        onClick={() => setReportOpen(true)}
                    >
                        <FiFlag size={18} />
                        Báo cáo đơn
                    </button>
                ) : null}

                {/* Buyer Actions */}
                {activeTab === 'purchases' && order.status?.name === 'DELIVERED' && (
                    <button
                        className={cx('btn-feedback')}
                        onClick={() => onFeedback(order)}
                    >
                        <FiStar size={18} />
                        Đánh giá
                    </button>
                )}

                {activeTab === 'purchases' && order.status?.name === 'CONFIRMED' && (
                    <button
                        className={cx('btn-payment')}
                        onClick={() => onPayment(order.id)}
                        disabled={actionLoading}
                    >
                        <FiCreditCard size={18} />
                        Xác nhận thanh toán
                    </button>
                )}

                {activeTab === 'sales' && order.status?.name === 'PENDING' && (
                    <div className={cx('seller-actions')}>
                        <button
                            className={cx('btn-reject')}
                            onClick={() => onReject(order.id)}
                            disabled={actionLoading}
                        >
                            <FiX size={18} />
                            Từ chối
                        </button>
                        <button
                            className={cx('btn-approve')}
                            onClick={() => onApprove(order.id, order.paymentMethod?.name)}
                            disabled={actionLoading}
                        >
                            <FiCheck size={18} />
                            {order.paymentMethod?.name === 'MIDDLEMAN' ? 'Chọn đơn + TK NH' : 'Chọn đơn này'}
                        </button>
                    </div>
                )}

                {activeTab === 'sales' && order.status?.name === 'CONFIRMED' && (
                    <button
                        className={cx('btn-deliver')}
                        onClick={() => onPaymentConfirmed(order.id)}
                        disabled={actionLoading}
                    >
                        <FiCheckCircle size={18} />
                        Xác nhận thanh toán
                    </button>
                )}

                {activeTab === 'sales' && order.status?.name === 'PAID_WAITING_PICKUP' && (
                    <button
                        className={cx('btn-deliver')}
                        onClick={() => onShipping(order.id)}
                        disabled={actionLoading}
                    >
                        <FiPackage size={18} />
                        Chuyển sang giao hàng
                    </button>
                )}

                {activeTab === 'sales' && order.status?.name === 'SHIPPING' && (
                    <button
                        className={cx('btn-deliver')}
                        onClick={() => onDelivered(order.id)}
                        disabled={actionLoading}
                    >
                        <FiCheckCircle size={18} />
                        Giao hàng thành công
                    </button>
                )}
            </div>

            <ReportModal
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                variant="order"
                targetId={order.id}
                subtitle={`Mã đơn #${order.id?.substring(0, 8).toUpperCase()}`}
            />
        </div>
    );
};

export default OrderCard;
