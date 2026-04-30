import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames/bind';
import styles from './OrderDetailPage.module.scss';
import orderService from '../../../services/orderService';
const cx = classNames.bind(styles);

const OrderDetailPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Lấy role từ URL: purchases = người mua, sales = người bán
    const userRole = searchParams.get('role') || 'purchases';

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Xử lý xác nhận đơn hàng (người bán)
    const handleConfirmOrder = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xác nhận đơn hàng này?")) return;
        
        setActionLoading(true);
        try {
            await orderService.updateOrderStatus(id, 'CONFIRMED');
            toast.success("Xác nhận đơn hàng thành công");
            // Refresh lại dữ liệu
            const data = await orderService.getOrderDetail(id);
            setOrder(data);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xác nhận đơn hàng");
        } finally {
            setActionLoading(false);
        }
    };

    // Xử lý hủy đơn hàng
    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
        
        setActionLoading(true);
        try {
            await orderService.updateOrderStatus(id, 'CANCELLED');
            toast.success("Hủy đơn hàng thành công");
            // Refresh lại dữ liệu
            const data = await orderService.getOrderDetail(id);
            setOrder(data);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi hủy đơn hàng");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className={cx('loading')}>Đang tải...</div>;
    if (!order) return <div className={cx('error')}>Đơn hàng không tồn tại.</div>;

    // Debug: hiển thị thông tin để kiểm tra
    console.log('Full Order Data:', order);

    // Lấy status từ object (có thể là string hoặc object)
    const orderStatus = order.status?.code || order.status || order.status?.name;
    const statusName = order.status?.message || order.status;

    return (
        <div className={cx('order-detail-wrapper')}>
            <button className={cx('back-btn')} onClick={() => navigate(`/order/myOrder?tab=${userRole}`)}>
                <i className="fa-solid fa-arrow-left"></i> Quay lại
            </button>

            <div className={cx('detail-header')}>
                <div className={cx('header-left')}>
                    <h2>Chi tiết đơn hàng</h2>
                    <span className={cx('order-id')}>Mã đơn: {order.id}</span>
                </div>
                <div className={cx('status-badge', orderStatus)}>
                    {statusName}
                </div>
            </div>

            <div className={cx('detail-grid')}>
                {/* Thông tin người nhận */}
                <div className={cx('info-card')}>
                    <h3 className={cx('card-title')}>📍 Thông tin nhận hàng</h3>
                    <div className={cx('info-content')}>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Người nhận:</span>
                            <span className={cx('value')}>{order.receiverName || 'Chưa có'}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Số điện thoại:</span>
                            <span className={cx('value')}>{order.receiverPhone || 'Chưa có'}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Địa chỉ:</span>
                            <span className={cx('value')}>{order.shippingAddress || 'Chưa có'}</span>
                        </div>
                    </div>
                </div>

                {/* Thanh toán */}
                <div className={cx('info-card')}>
                    <h3 className={cx('card-title')}>💳 Thanh toán</h3>
                    <div className={cx('info-content')}>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Phương thức:</span>
                            <span className={cx('value', 'method')}>
                                {order.paymentMethod === 'MIDDLEMAN' ? '🛡️ Trung gian' : '🤝 Trực tiếp'}
                            </span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Trạng thái thanh toán:</span>
                            <span className={cx('value')}>{order.paymentStatus || 'Chờ thanh toán'}</span>
                        </div>
                        <div className={cx('info-row', 'total-row')}>
                            <span className={cx('label')}>TỔNG CỘNG:</span>
                            <span className={cx('value', 'highlight')}>{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Thông tin người mua */}
                <div className={cx('info-card')}>
                    <h3 className={cx('card-title')}>👤 Người mua</h3>
                    <div className={cx('info-content')}>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>ID:</span>
                            <span className={cx('value')}>{order.buyserId || order.buyerId || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Thông tin người bán */}
                <div className={cx('info-card')}>
                    <h3 className={cx('card-title')}>🏪 Người bán</h3>
                    <div className={cx('info-content')}>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>ID:</span>
                            <span className={cx('value')}>{order.sellerId || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar - Chỉ hiển thị khi là người bán và đơn PENDING */}
            {userRole === 'sales' && orderStatus === 1 && (
                <div className={cx('action-bar')}>
                    <button 
                        className={cx('btn-cancel')} 
                        onClick={handleCancelOrder}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                    </button>
                    <button 
                        className={cx('btn-confirm')} 
                        onClick={handleConfirmOrder}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Đang xử lý...' : 'Xác nhận đơn'}
                    </button>
                </div>
            )}

            {/* Người mua cũng có thể hủy khi đơn PENDING */}
            {userRole === 'purchases' && orderStatus === 1 && (
                <div className={cx('action-bar')}>
                    <button 
                        className={cx('btn-cancel')} 
                        onClick={handleCancelOrder}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderDetailPage;