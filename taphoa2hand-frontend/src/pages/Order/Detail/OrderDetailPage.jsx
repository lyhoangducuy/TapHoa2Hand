import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames/bind';
import styles from './OrderDetailPage.module.scss';
import orderService from '../../../services/orderService';
import * as feedbackService from '../../../services/feedbackService';
import { FeedbackForm, FeedbackList } from '../../../components/Feedback';

const cx = classNames.bind(styles);

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState(null);

    const currentUserId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await orderService.getOrderDetail(orderId);
                setOrder(res.data?.result);
                
                if (res.data?.result?.id) {
                    fetchFeedback(res.data?.result?.id);
                }
            } catch {
                toast.error("Không tải được đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const fetchFeedback = async (orderId) => {
        try {
            const res = await feedbackService.getFeedbackByOrderId(orderId);
            if (res.data?.result) {
                setExistingFeedback(res.data?.result);
            }
        } catch {
            setExistingFeedback(null);
        }
    };

    const refreshOrder = async () => {
        const res = await orderService.getOrderDetail(orderId);
        setOrder(res.data?.result);
        fetchFeedback(res.data?.result?.id);
    };

    const handleConfirm = async () => {
        if (!window.confirm("Xác nhận đơn?")) return;

        try {
            setActionLoading(true);
            await orderService.updateOrderStatus(orderId, 'CONFIRMED');
            toast.success("Đã xác nhận");
            await refreshOrder();
        } catch {
            toast.error("Lỗi xác nhận");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Hủy đơn?")) return;

        try {
            setActionLoading(true);
            await orderService.updateOrderStatus(orderId, 'CANCELLED');
            toast.success("Đã hủy");
            await refreshOrder();
        } catch {
            toast.error("Lỗi hủy");
        } finally {
            setActionLoading(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);

    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: { color: '#ff9800', text: '⏳ Chờ xác nhận' },
            CONFIRMED: { color: '#2196f3', text: '✓ Đã xác nhận' },
            COMPLETED: { color: '#4caf50', text: '✓ Đã hoàn thành' },
            CANCELLED: { color: '#f44336', text: '✗ Đã hủy' },
        };
        return statusMap[status] || { color: '#999', text: status };
    };

    if (loading) return <div className={cx('loading')}>
        <div className={cx('spinner')}></div>
        <p>Đang tải...</p>
    </div>;
    
    if (!order) return <div className={cx('error')}>Không tìm thấy đơn hàng</div>;

    const orderStatus = order.status?.name;
    const statusInfo = getStatusBadge(orderStatus);
    const isBuyer = order.buyserId === currentUserId;
    const isSeller = order.sellerId === currentUserId;

    const paymentMethod = order.paymentMethod?.name === 'MIDDLEMAN' ? 'Trung gian (Bảo vệ)' : 'Trực tiếp';
    const paymentStatus = order.paymentStatus?.displayName || 'Chưa thanh toán';

    return (
        <div className={cx('container')}>
            <div className={cx('header')}>
                <button className={cx('back-btn')} onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>
                <div className={cx('title-section')}>
                    <h1>Đơn hàng #{order.id?.substring(0, 8)}</h1>
                    <span className={cx('status-badge')} style={{ backgroundColor: statusInfo.color }}>
                        {statusInfo.text}
                    </span>
                </div>
            </div>

            <div className={cx('content')}>
                {/* Order Info Grid */}
                <div className={cx('info-grid')}>
                    {/* Shipping Info */}
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <h3>📦 Thông tin giao hàng</h3>
                        </div>
                        <div className={cx('card-body')}>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Người nhận:</span>
                                <span className={cx('value')}>{order.receiverName || '---'}</span>
                            </div>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Số điện thoại:</span>
                                <span className={cx('value')}>{order.receiverPhone || '---'}</span>
                            </div>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Địa chỉ:</span>
                                <span className={cx('value')}>{order.shippingAddress || '---'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <h3>💳 Thông tin thanh toán</h3>
                        </div>
                        <div className={cx('card-body')}>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Phương thức:</span>
                                <span className={cx('value')}>{paymentMethod}</span>
                            </div>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Trạng thái:</span>
                                <span className={cx('value', 'payment-status')}>{paymentStatus}</span>
                            </div>
                            <div className={cx('info-row', 'total-row')}>
                                <span className={cx('label')}>Tổng tiền:</span>
                                <span className={cx('value', 'total-amount')}>
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Buyer Info */}
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <h3>👤 Người mua</h3>
                        </div>
                        <div className={cx('card-body')}>
                            <div className={cx('user-info')}>
                                <p className={cx('user-id')}>{order.buyserId}</p>
                                {isBuyer && <span className={cx('you-badge')}>Bạn</span>}
                            </div>
                        </div>
                    </div>

                    {/* Seller Info */}
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <h3>🏪 Người bán</h3>
                        </div>
                        <div className={cx('card-body')}>
                            <div className={cx('user-info')}>
                                <p className={cx('user-id')}>{order.sellerId}</p>
                                {isSeller && <span className={cx('you-badge')}>Bạn</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {((isSeller && orderStatus === 'PENDING') || (isBuyer && orderStatus === 'PENDING')) && (
                    <div className={cx('action-section')}>
                        {isSeller && orderStatus === 'PENDING' && (
                            <>
                                <button 
                                    className={cx('btn', 'btn-cancel')}
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? '⏳ Đang xử lý...' : 'Hủy đơn'}
                                </button>
                                <button 
                                    className={cx('btn', 'btn-primary')}
                                    onClick={handleConfirm}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? '⏳ Đang xử lý...' : 'Xác nhận đơn'}
                                </button>
                            </>
                        )}
                        {isBuyer && orderStatus === 'PENDING' && (
                            <button 
                                className={cx('btn', 'btn-cancel')}
                                onClick={handleCancel}
                                disabled={actionLoading}
                            >
                                {actionLoading ? '⏳ Đang xử lý...' : 'Hủy đơn'}
                            </button>
                        )}
                    </div>
                )}

                {/* Feedback Section - For Buyer */}
                {isBuyer && orderStatus === 'DELIVERED' && (
                    <div className={cx('feedback-section')}>
                        <div className={cx('section-header')}>
                            <h2>⭐ Đánh giá đơn hàng</h2>
                            <p className={cx('section-subtitle')}>Chia sẻ trải nghiệm mua sắm của bạn</p>
                        </div>

                        {!existingFeedback && !showFeedbackForm && (
                            <button 
                                className={cx('btn', 'btn-feedback')}
                                onClick={() => setShowFeedbackForm(true)}
                            >
                                ✍️ Viết đánh giá
                            </button>
                        )}
                        
                        {showFeedbackForm && !existingFeedback && (
                            <div className={cx('feedback-form-wrapper')}>
                                <FeedbackForm 
                                    orderId={order.id}
                                    targetUserName={order.sellerName || 'Người bán'}
                                    onSuccess={(feedback) => {
                                        setExistingFeedback(feedback);
                                        setShowFeedbackForm(false);
                                        toast.success('Đánh giá đã được gửi!');
                                    }}
                                    onCancel={() => setShowFeedbackForm(false)}
                                />
                            </div>
                        )}
                        
                        {existingFeedback && (
                            <div className={cx('feedback-display')}>
                                <h3>Đánh giá của bạn</h3>
                                <FeedbackList feedbacks={[existingFeedback]} />
                            </div>
                        )}
                    </div>
                )}

                {/* Feedback Section - For Seller */}
                {isSeller && (
                    <div className={cx('feedback-section')}>
                        <div className={cx('section-header')}>
                            <h2>⭐ Đánh giá từ khách hàng</h2>
                        </div>

                        {existingFeedback ? (
                            <FeedbackList feedbacks={[existingFeedback]} />
                        ) : (
                            <div className={cx('no-feedback')}>
                                <p>Chưa có đánh giá từ khách hàng cho đơn hàng này</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;