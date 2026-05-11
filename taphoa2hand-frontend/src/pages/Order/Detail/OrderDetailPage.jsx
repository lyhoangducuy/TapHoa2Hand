import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames/bind';
import styles from './OrderDetailPage.module.scss';
import orderService from '../../../services/orderService';
import { getUserById } from '../../../services/userService';
import * as feedbackService from '../../../services/feedbackService';
import { FeedbackForm, FeedbackList } from '../../../components/Feedback';

const cx = classNames.bind(styles);

const decodeJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        console.error('Invalid token when decoding JWT:', error);
        return null;
    }
};

const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decoded = decodeJwt(token);
        return decoded?.id || decoded?.userId || decoded?.sub || null;
    } catch (error) {
        console.error('Token decode failed:', error);
        return null;
    }
};

const statusSteps = [
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'DELIVERED', label: 'Đã giao thành công' },
    { key: 'CANCELLED', label: 'Đã hủy' },
];

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [buyerInfo, setBuyerInfo] = useState({});
    const [sellerInfo, setSellerInfo] = useState({});
    const [sellerBankForm, setSellerBankForm] = useState({ bankName: '', accountName: '', accountNumber: '' });

    const currentUserId = getCurrentUserId();

    const getUserIdFromOrder = (orderData, userIdField) => {
        if (!orderData) return null;
        if (orderData[userIdField]) return orderData[userIdField];
        const userObj = orderData[userIdField.replace('Id', '')];
        if (typeof userObj === 'string') return userObj;
        if (userObj && typeof userObj === 'object') return userObj.id;
        return null;
    };

    const fetchUserInfo = async (userId, setter) => {
        if (!userId) return;
        try {
            const res = await getUserById(userId);
            const data = res?.result || res?.data || res;
            if (data) setter(data);
        } catch (error) {
            console.error('Error fetching user info', userId, error);
        }
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await orderService.getOrderDetail(orderId);
                const responseOrder = res.data?.result || res.data || res;
                setOrder(responseOrder);

                const buyerId = getUserIdFromOrder(responseOrder, 'buyerId');
                const sellerId = getUserIdFromOrder(responseOrder, 'sellerId');
                setBuyerInfo({});
                setSellerInfo({});
                await fetchUserInfo(buyerId, setBuyerInfo);
                await fetchUserInfo(sellerId, setSellerInfo);

                if (responseOrder?.id) {
                    fetchFeedback(responseOrder.id);
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
            if (res.result) {
                setExistingFeedback(res.result);
            }
        } catch {
            // Không có feedback hoặc lỗi, set null
            setExistingFeedback(null);
        }
    };

    const refreshOrder = async () => {
        const res = await orderService.getOrderDetail(orderId);
        const responseOrder = res.data?.result || res.data || res;
        setOrder(responseOrder);
        fetchFeedback(responseOrder?.id);
        const buyerId = getUserIdFromOrder(responseOrder, 'buyerId');
        const sellerId = getUserIdFromOrder(responseOrder, 'sellerId');
        setBuyerInfo({});
        setSellerInfo({});
        await fetchUserInfo(buyerId, setBuyerInfo);
        await fetchUserInfo(sellerId, setSellerInfo);
    };

    const handleConfirm = async () => {
        if (order.paymentMethod?.name === 'MIDDLEMAN') {
            const { bankName, accountName, accountNumber } = sellerBankForm;
            if (!bankName || !accountName || !accountNumber) {
                toast.warning('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng của bạn trước khi xác nhận.');
                return;
            }
        }

        if (!window.confirm("Xác nhận đơn?")) return;

        try {
            setActionLoading(true);
            if (order.paymentMethod?.name === 'MIDDLEMAN') {
                await orderService.updateOrderStatus(orderId, 'CONFIRMED', sellerBankForm);
            } else {
                await orderService.updateOrderStatus(orderId, 'CONFIRMED');
            }
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

    const handleSellerBankChange = (e) => {
        const { name, value } = e.target;
        setSellerBankForm((prev) => ({ ...prev, [name]: value }));
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
            DELIVERED: { color: '#4caf50', text: '✓ Đã giao thành công' },
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
    const buyerId = getUserIdFromOrder(order, 'buyerId');
    const sellerId = getUserIdFromOrder(order, 'sellerId');
    const isBuyer = buyerId === currentUserId;
    const isSeller = sellerId === currentUserId;

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
                    {/* Order Status Timeline */}
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <h3>📍 Trạng thái đơn hàng</h3>
                        </div>
                        <div className={cx('card-body')}>
                            {statusSteps.map((step, index) => {
                                const currentIndex = statusSteps.findIndex((item) => item.key === order.status?.name);
                                const active = currentIndex >= index && order.status?.name !== 'CANCELLED';
                                const cancelled = order.status?.name === 'CANCELLED' && step.key === 'CANCELLED';
                                return (
                                    <div key={step.key} className={cx('info-row')}>
                                        <span className={cx('label')}>
                                            {index + 1}. {step.label}
                                        </span>
                                        <span className={cx('value')}>
                                            {cancelled ? 'Đã hủy' : active ? 'Hoàn thành' : 'Chưa'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

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

                    {order.paymentMethod?.name === 'MIDDLEMAN' && (
                        <div className={cx('card')}>
                            <div className={cx('card-header')}>
                                <h3>🏦 Thông tin ngân hàng</h3>
                            </div>
                            <div className={cx('card-body')}>
                                {order.buyerBankInfo && (
                                    <>
                                        <div className={cx('section-title')}>Thông tin tài khoản người mua</div>
                                        <div className={cx('info-row')}>
                                            <span className={cx('label')}>Ngân hàng:</span>
                                            <span className={cx('value')}>{order.buyerBankInfo.bankName}</span>
                                        </div>
                                        <div className={cx('info-row')}>
                                            <span className={cx('label')}>Chủ tài khoản:</span>
                                            <span className={cx('value')}>{order.buyerBankInfo.accountName}</span>
                                        </div>
                                        <div className={cx('info-row')}>
                                            <span className={cx('label')}>Số tài khoản:</span>
                                            <span className={cx('value')}>{order.buyerBankInfo.accountNumber}</span>
                                        </div>
                                    </>
                                )}

                                {isSeller && orderStatus === 'PENDING' && !order.sellerBankInfo && (
                                    <div className={cx('form-section')}>
                                        <div className={cx('section-title')}>Nhập thông tin tài khoản của bạn để nhận tiền</div>
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
                                )}

                                {order.sellerBankInfo && (
                                    <>
                                        <div className={cx('section-title')}>Thông tin tài khoản người bán</div>
                                        <div className={cx('info-row')}>
                                            <span className={cx('label')}>Ngân hàng:</span>
                                            <span className={cx('value')}>{order.sellerBankInfo.bankName}</span>
                                        </div>
                                        <div className={cx('info-row')}>
                                            <span className={cx('label')}>Chủ tài khoản:</span>
                                            <span className={cx('value')}>{order.sellerBankInfo.accountName}</span>
                                        </div>
                                        <div className={cx('info-row')}>
                                            <span className={cx('label')}>Số tài khoản:</span>
                                            <span className={cx('value')}>{order.sellerBankInfo.accountNumber}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Buyer Info */}
                    <div className={cx('card')}>
                        <div className={cx('card-header')}>
                            <h3>👤 Người mua</h3>
                        </div>
                        <div className={cx('card-body')}>
                            <div className={cx('user-info')}>
                                <div className={cx('user-meta')}>
                                    <div className={cx('avatar')}>
                                        {buyerInfo.avatar ? <img src={buyerInfo.avatar} alt="avatar" /> : '👤'}
                                    </div>
                                    <div>
                                        <p className={cx('user-id')}>{buyerInfo.fullName || buyerInfo.username || order.buyerId}</p>
                                        {buyerInfo.username && <p className={cx('user-username')}>@{buyerInfo.username}</p>}
                                        {buyerInfo.email && <p className={cx('user-email')}>{buyerInfo.email}</p>}
                                    </div>
                                </div>
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
                                <div className={cx('user-meta')}>
                                    <div className={cx('avatar')}>
                                        {sellerInfo.avatar ? <img src={sellerInfo.avatar} alt="avatar" /> : '🏪'}
                                    </div>
                                    <div>
                                        <p className={cx('user-id')}>{sellerInfo.fullName || sellerInfo.username || order.sellerId}</p>
                                        {sellerInfo.username && <p className={cx('user-username')}>@{sellerInfo.username}</p>}
                                        {sellerInfo.email && <p className={cx('user-email')}>{sellerInfo.email}</p>}
                                    </div>
                                </div>
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
                {isSeller && orderStatus === 'DELIVERED' && (
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