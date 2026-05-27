import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import {
    FiEye, FiStar, FiX, FiCheck, FiCreditCard,
    FiPackage, FiCheckCircle, FiFlag, FiMapPin,
    FiPhone, FiUser, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

import * as feedbackService from '../../../../services/feedbackService';
import { getToken } from '../../../../services/localStorageService';
import ReportModal from '../../../../components/Report/ReportModal';

import styles from './OrderCard.module.scss';

const cx = classNames.bind(styles);

// ─── Stepper config cho thanh toán TRUNG GIAN ───
const STEPS_MIDDLEMAN = [
    'PENDING', 'CONFIRMED', 'PAID_WAITING_PICKUP', 'SHIPPING', 'DELIVERED', 'SETTLING', 'COMPLETED'
];

// ─── Stepper config cho thanh toán TRỰC TIẾP ───
const STEPS_DIRECT = [
    'PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED'
];

const STEP_LABELS_MIDDLEMAN = {
    PENDING: 'Chờ duyệt',
    CONFIRMED: 'Đã duyệt',
    PAID_WAITING_PICKUP: 'Đã thanh toán',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    SETTLING: 'Quyết toán',
    COMPLETED: 'Hoàn thành',
};

const STEP_LABELS_DIRECT = {
    PENDING: 'Chờ duyệt',
    CONFIRMED: 'Đã duyệt',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    COMPLETED: 'Hoàn thành',
};

const STATUS_COLORS = {
    PENDING: { bg: '#fff9e6', color: '#b45309', dot: '#f59e0b' },
    CONFIRMED: { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
    PAID_WAITING_PICKUP: { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
    SHIPPING: { bg: '#faf5ff', color: '#6b21a8', dot: '#a855f7' },
    DELIVERED: { bg: '#ecfdf5', color: '#065f46', dot: '#10b981' },
    SETTLING: { bg: '#fff7ed', color: '#9a3412', dot: '#f97316' },
    COMPLETED: { bg: '#f0fdfa', color: '#134e4a', dot: '#14b8a6' },
    CANCELLED: { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
    REPORTED: { bg: '#fefce8', color: '#854d0e', dot: '#eab308' },
};

function getStepIndex(status, steps) {
    return steps.indexOf(status);
}

const OrderCard = ({
    order,
    activeTab,
    onFeedback,
    onPayment,
    onReject,
    onApprove,
    onShipping,
    onDelivered,
    actionLoading,
    onConfirmDelivery,
    onReportSuccess
}) => {
    const navigate = useNavigate();

    const [reportOpen, setReportOpen] = useState(false);
    const [hasFeedback, setHasFeedback] = useState(false);
    const [checkingFeedback, setCheckingFeedback] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const hasToken = Boolean(getToken());
    const statusName = order?.status?.name;
    const isBuyer = activeTab === 'purchases';
    const isDirectPayment = order?.paymentMethod?.name === 'DIRECT';

    // Chọn steps và labels dựa trên phương thức thanh toán
    const steps = isDirectPayment ? STEPS_DIRECT : STEPS_MIDDLEMAN;
    const stepLabels = isDirectPayment ? STEP_LABELS_DIRECT : STEP_LABELS_MIDDLEMAN;
    const stepIndex = getStepIndex(statusName, steps);

    const sc = STATUS_COLORS[statusName] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);

    const paymentMethodLabel = isDirectPayment ? 'Trực tiếp' : 'Trung gian';

    useEffect(() => {
        if (!order?.id) return;
        const check = async () => {
            try {
                setCheckingFeedback(true);
                const res = await feedbackService.checkFeedbackExists(order.id);
                setHasFeedback(res?.result || false);
            } catch {
                setHasFeedback(false);
            } finally {
                setCheckingFeedback(false);
            }
        };
        check();
    }, [order?.id]);

    const handleReportSuccess = () => {
        setReportOpen(false);
        onReportSuccess?.();
    };

    const canFeedback = isBuyer &&
        statusName === 'COMPLETED' &&
        !hasFeedback;

    // Kiểm tra nút hành động dựa trên phương thức thanh toán
    const showShippingButtons = !isDirectPayment || statusName === 'SHIPPING' || statusName === 'DELIVERED'; // Hiện nút giao hàng cho trung gian, hoặc trực tiếp ở bước shipping/delivered
    const showDirectShippingStart = isDirectPayment && isBuyer && statusName === 'CONFIRMED'; // Người mua báo đã giao cho trực tiếp
    const showDirectShippingConfirm = isDirectPayment && !isBuyer && statusName === 'SHIPPING'; // Người bán xác nhận đã giao cho trực tiếp

    return (
        <div className={cx('card')} style={{ '--status-color': sc.color, '--status-dot': sc.dot }}>

            {/* HEADER */}


            {/* STEPPER - Hiển thị khác nhau cho từng phương thức */}
            {!['CANCELLED', 'CANCELLED_AUTO', 'REPORTED'].includes(statusName) && (
                <div className={cx('stepper')}>
                    {steps.map((stepKey, i) => {
                        const done = stepIndex > i;
                        const active = stepIndex === i;
                        return (
                            <div key={stepKey} className={cx('step', { done, active })}>
                                <div className={cx('step-dot')}>
                                    {done ? <FiCheck size={10} /> : <span>{i + 1}</span>}
                                </div>
                                <span className={cx('step-label')}>{stepLabels[stepKey]}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {(statusName === 'CANCELLED' || statusName === 'CANCELLED_AUTO') && (
                <div className={cx('cancelled-banner')}>
                    <FiX size={14} /> Đơn đã bị hủy
                </div>
            )}

            {statusName === 'REPORTED' && (
                <div className={cx('reported-banner')}>
                    <FiFlag size={14} /> Đơn đang bị báo cáo, chờ xử lý
                </div>
            )}

            {/* BODY PREVIEW */}
            <div className={cx('body-preview')}>
                <div className={cx('info-row')}>
                    <div className={cx('info-item')}>
                        <FiUser size={14} />
                        <span>{order.receiverName || '—'}</span>
                    </div>
                    <div className={cx('info-item')}>
                        <FiPhone size={14} />
                        <span>{order.receiverPhone || '—'}</span>
                    </div>
                </div>
                <div className={cx('info-row')}>
                    <div className={cx('info-item', 'full')}>
                        <FiMapPin size={14} />
                        <span>{order.shippingAddress || '—'}</span>
                    </div>
                </div>

            </div>

            <div className={cx('body-expanded')}>
                <div className={cx('detail-section')}>
                    <h4 className={cx('detail-title')}>
                        Người {isBuyer ? 'bán' : 'mua'}
                    </h4>
                    <div className={cx('party-row')}>
                        <span className={cx('party-name')}>
                            {isBuyer ? order.sellerUsername : order.buyerUsername}
                        </span>
                    </div>
                </div>

                <div className={cx('detail-section')}>
                    <h4 className={cx('detail-title')}>Thanh toán</h4>
                    <div className={cx('payment-row')}>
                        <span className={cx('payment-method')}>{paymentMethodLabel}</span>
                        <span className={cx('payment-amount')}>
                            {formatCurrency(order.totalAmount)}
                        </span>
                    </div>
                    {!isDirectPayment && order.holdUntil && (
                        <p className={cx('escrow-note')}>
                            ⏱ Giữ tiền đến: {new Date(order.holdUntil).toLocaleString('vi-VN')}
                        </p>
                    )}
                    {isDirectPayment && (
                        <p className={cx('escrow-note')}>
                            💵 Thanh toán trực tiếp - Không qua trung gian
                        </p>
                    )}
                </div>
            </div>


            {/* FOOTER */}
            <div className={cx('footer')}>
                <button className={cx('btn-detail')} onClick={() => navigate(`/order/myOrder/${order.id}`)}>
                    <FiEye /> Chi tiết
                </button>

                {hasToken && statusName !== 'REPORTED' && (
                    <button className={cx('btn-report')} onClick={() => setReportOpen(true)}>
                        <FiFlag /> Báo cáo
                    </button>
                )}

                {canFeedback && (
                    <button
                        className={cx('btn-feedback')}
                        onClick={() => onFeedback(order)}
                        disabled={checkingFeedback}
                    >
                        <FiStar /> {checkingFeedback ? '...' : 'Đánh giá'}
                    </button>
                )}

                {hasFeedback && (
                    <span className={cx('feedback-done')}>✔ Đã đánh giá</span>
                )}

                {/* Nút thanh toán - chỉ cho trung gian khi người mua thấy CONFIRMED */}
                {isBuyer && statusName === 'CONFIRMED' && !isDirectPayment && (
                    <button className={cx('btn-pay')} onClick={() => onPayment(order.id)}>
                        <FiCreditCard /> Thanh toán
                    </button>
                )}

                {/* Nút duyệt/từ chối của người bán - cho cả 2 phương thức */}
                {!isBuyer && (statusName === 'PENDING' || statusName === 'CONFIRMED' || statusName==='PAID_WAITING_PICKUP') && (
                    <>
                        <button className={cx('btn-reject')} onClick={() => onReject(order.id)}>
                            <FiX /> Từ chối
                        </button>
                        {statusName === 'PENDING' && (
                            <button className={cx('btn-approve')} onClick={() => onApprove(order.id, order.paymentMethod?.name)}>
                                <FiCheck /> Duyệt
                            </button>
                        )}
                    </>
                )}

                {/* Nút giao hàng cho thanh toán trung gian - NGƯỜI BÁN */}
                {!isBuyer && !isDirectPayment && statusName === 'PAID_WAITING_PICKUP' && (
                    <button
                        className={cx('btn-shipping')}
                        onClick={() => onShipping(order.id)}
                    >
                        <FiPackage /> Đang giao
                    </button>
                )}

                {/* Nút giao hàng cho thanh toán trung gian - Xác nhận đã giao */}
                {!isBuyer && !isDirectPayment && statusName === 'SHIPPING' && (
                    <button className={cx('btn-deliver')} onClick={() => onDelivered(order.id)}>
                        <FiCheckCircle /> Đã giao
                    </button>
                )}

                {/* Nút giao hàng cho thanh toán TRỰC TIẾP - Người bán bắt đầu giao */}
                {!isBuyer && isDirectPayment && statusName === 'CONFIRMED' && (
                    <button
                        className={cx('btn-shipping')}
                        onClick={() => onShipping(order.id)}
                    >
                        <FiPackage /> Bắt đầu giao
                    </button>
                )}

                {/* Nút giao hàng cho thanh toán TRỰC TIẾP - Xác nhận đã giao */}
                {!isBuyer && isDirectPayment && statusName === 'SHIPPING' && (
                    <button className={cx('btn-deliver')} onClick={() => onDelivered(order.id)}>
                        <FiCheckCircle /> Đã giao
                    </button>
                )}

                {/* Nút xác nhận của người mua - KHÁC nhau giữa 2 phương thức */}
                {isBuyer && !isDirectPayment && statusName === 'DELIVERED' && (
                    <button className={cx('btn-confirm')} onClick={() => onConfirmDelivery(order.id, order.paymentMethod?.name)}>
                        <FiCheckCircle /> Xác nhận
                    </button>
                )}

                {/* Với thanh toán trực tiếp: người mua xác nhận hoàn thành sau khi đã giao */}
                {isBuyer && isDirectPayment && statusName === 'DELIVERED' && (
                    <button className={cx('btn-confirm')} onClick={() => onConfirmDelivery(order.id, order.paymentMethod?.name)}>
                        <FiCheckCircle /> Xác nhận hoàn thành
                    </button>
                )}
            </div>

            <ReportModal
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                onSuccess={handleReportSuccess}
                variant="order"
                targetId={order.id}
            />
        </div>
    );
};

export default OrderCard;
