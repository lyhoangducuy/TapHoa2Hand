import React, { useState, useEffect } from 'react';
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

import * as feedbackService from '../../../../services/feedbackService';
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

    const hasToken = Boolean(getToken());

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);

    // CHECK FEEDBACK
    useEffect(() => {
        const checkFeedback = async () => {
            try {
                setCheckingFeedback(true);

                const res = await feedbackService.checkFeedbackExists(order.id);

                setHasFeedback(res?.result || false);
            } catch (err) {
                console.error('check feedback error:', err);
                setHasFeedback(false);
            } finally {
                setCheckingFeedback(false);
            }
        };

        if (order?.id) {
            checkFeedback();
        }
    }, [order?.id]);

    const handleReportSuccess = () => {
        setReportOpen(false);
        onReportSuccess?.();
    };

    return (
        <div className={cx('order-card')}>

            {/* HEADER */}
            <div className={cx('order-header')}>
                <div>
                    <span>Mã đơn:</span>
                    <b>#{order.id?.substring(0, 8).toUpperCase()}</b>
                </div>

                <div className={cx('order-status-badge', order.status?.name?.toLowerCase())}>
                    {order.status?.displayName}
                </div>
            </div>

            {/* BODY */}
            <div className={cx('order-body')}>
                <div>{order.receiverName}</div>
                <div>{order.receiverPhone}</div>
                <div>{order.shippingAddress}</div>

                <div>
                    {formatCurrency(order.totalAmount)}
                </div>
            </div>

            {/* FOOTER */}
            <div className={cx('order-footer')}>

                <button
                    onClick={() => navigate(`/order/myOrder/${order.id}`)}
                >
                    <FiEye /> Xem
                </button>

                {/* REPORT */}
                {hasToken && order.status?.name !== 'REPORTED' && (
                    <button onClick={() => setReportOpen(true)}>
                        <FiFlag /> Báo cáo
                    </button>
                )}

                {/* FEEDBACK BUTTON */}
                {activeTab === 'purchases' &&
                    ['DELIVERED', 'SETTLING', 'COMPLETED'].includes(order.status?.name) &&
                    !hasFeedback && (
                        <button
                            onClick={() => onFeedback(order)}
                            disabled={checkingFeedback}
                        >
                            <FiStar />
                            {checkingFeedback ? 'Checking...' : 'Đánh giá'}
                        </button>
                    )
                }

                {/* SHOW IF ALREADY FEEDBACK */}
                {hasFeedback && (
                    <span style={{ color: 'green' }}>
                        ✔ Đã đánh giá
                    </span>
                )}

                {/* PAYMENT */}
                {activeTab === 'purchases' && order.status?.name === 'CONFIRMED' && (
                    <button onClick={() => onPayment(order.id)}>
                        <FiCreditCard /> Thanh toán
                    </button>
                )}

                {/* SELLER ACTIONS */}
                {(order.status?.name === 'PENDING' || order.status?.name === 'CONFIRMED') && (
                    <>
                        <button onClick={() => onReject(order.id)}>
                            <FiX /> Từ chối
                        </button>

                        {activeTab === 'sales' && order.status?.name === 'PENDING' && (
                            <button onClick={() => onApprove(order.id)}>
                                <FiCheck /> Duyệt
                            </button>
                        )}
                    </>
                )}

                {activeTab === 'sales' && order.status?.name === 'SHIPPING' && (
                    <button onClick={() => onDelivered(order.id)}>
                        <FiCheckCircle /> Giao xong
                    </button>
                )}

                {activeTab === 'purchases' && order.status?.name === 'DELIVERED' && (
                    <button onClick={() => onConfirmDelivery(order.id)}>
                        <FiCheckCircle /> Xác nhận
                    </button>
                )}
            </div>

            {/* REPORT MODAL */}
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