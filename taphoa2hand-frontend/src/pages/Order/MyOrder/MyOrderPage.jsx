import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from './MyOrderPage.module.scss';
import orderService from '../../../services/orderService';
const cx = classNames.bind(styles);

const MyOrderPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' hoặc 'sales'
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = activeTab === 'purchases' 
                ? await orderService.getPurchases() 
                : await orderService.getSales();
            setOrders(data || []);
        } catch (error) {
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            toast.success("Cập nhật trạng thái thành công");
            fetchOrders(); 
        } catch (error) {
            toast.error("Có lỗi xảy ra  khi cập nhật");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className={cx('my-order-wrapper')}>
            <h2 className={cx('page-title')}>Quản lý đơn hàng</h2>
            
            <div className={cx('order-tabs')}>
                <div 
                    className={cx('tab-item', { active: activeTab === 'purchases' })}
                    onClick={() => setActiveTab('purchases')}
                >
                    🛒 Đơn mua
                </div>
                <div 
                    className={cx('tab-item', { active: activeTab === 'sales' })}
                    onClick={() => setActiveTab('sales')}
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
                            <img src="/empty-box.png" alt="empty" /> {/* Nếu bạn có ảnh */}
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
                                    <div className={cx('order-status-badge', order.status)}>
                                        {order.status === 'PENDING' ? 'Chờ xác nhận' : 
                                         order.status === 'CONFIRMED' ? 'Đã xác nhận' :
                                         order.status === 'DELIVERED' ? 'Hoàn thành' : 'Đã hủy'}
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
                                        onClick={() => navigate(`/order/${order.id}`)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    
                                    {activeTab === 'sales' && order.status === 'PENDING' && (
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
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MyOrderPage;