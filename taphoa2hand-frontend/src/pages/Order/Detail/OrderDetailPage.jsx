import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames/bind';
import styles from './OrderDetailPage.module.scss'; // Đảm bảo đúng tên file module
import { orderService } from '../../../services/orderService';
const cx = classNames.bind(styles);

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await orderService.getOrderDetail(id);
                setOrder(data);
            } catch (error) {
                toast.error("Không tìm thấy thông tin đơn hàng");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div className={cx('loading')}>Đang tải...</div>;
    if (!order) return <div className={cx('error')}>Đơn hàng không tồn tại.</div>;

    return (
        <div className={cx('order-detail-wrapper')}>
            <button className={cx('back-btn')} onClick={() => navigate(-1)}>
                <i className="fa-solid fa-arrow-left"></i> Quay lại danh sách
            </button>

            <div className={cx('detail-header')}>
                <div className={cx('header-left')}>
                    <h2>Chi tiết đơn hàng</h2>
                    <span className={cx('order-id')}>Mã đơn: {order.id}</span>
                </div>
                <div className={cx('status-badge', order.status)}>
                    {order.status}
                </div>
            </div>

            <div className={cx('detail-grid')}>
                {/* Thông tin người nhận */}
                <div className={cx('info-card')}>
                    <h3 className={cx('card-title')}>📍 Thông tin nhận hàng</h3>
                    <div className={cx('info-content')}>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Người nhận:</span>
                            <span className={cx('value')}>{order.receiverName}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Số điện thoại:</span>
                            <span className={cx('value')}>{order.receiverPhone}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Địa chỉ:</span>
                            <span className={cx('value')}>{order.shippingAddress}</span>
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
                                {order.paymentMethod === 'MIDDLEMAN' ? '🛡️ Trung gian (Cọc 2%)' : '🤝 Trực tiếp'}
                            </span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Trạng thái:</span>
                            <span className={cx('value')}>{order.paymentStatus}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Phí sàn:</span>
                            <span className={cx('value')}>{formatCurrency(order.platformFee)}</span>
                        </div>
                        <div className={cx('info-row', 'total-row')}>
                            <span className={cx('label')}>TỔNG CỘNG:</span>
                            <span className={cx('value', 'highlight')}>{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Bank Người Mua */}
                {order.buyerBankInfo && (
                    <div className={cx('info-card', 'bank-card')}>
                        <h3 className={cx('card-title')}>🏧 Bank Người Mua (Hoàn tiền)</h3>
                        <div className={cx('info-content')}>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Ngân hàng:</span>
                                <span className={cx('value')}>{order.buyerBankInfo.bankName}</span>
                            </div>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Số tài khoản:</span>
                                <span className={cx('value', 'account-num')}>{order.buyerBankInfo.accountNumber}</span>
                            </div>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Chủ tài khoản:</span>
                                <span className={cx('value')}>{order.buyerBankInfo.accountName}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bank Người Bán */}
                {order.sellerBankInfo && (
                    <div className={cx('info-card', 'bank-card')}>
                        <h3 className={cx('card-title')}>🏧 Bank Người Bán (Nhận tiền)</h3>
                        <div className={cx('info-content')}>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Ngân hàng:</span>
                                <span className={cx('value')}>{order.sellerBankInfo.bankName}</span>
                            </div>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Số tài khoản:</span>
                                <span className={cx('value', 'account-num')}>{order.sellerBankInfo.accountNumber}</span>
                            </div>
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Chủ tài khoản:</span>
                                <span className={cx('value')}>{order.sellerBankInfo.accountName}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {order.status === 'PENDING' && (
                <div className={cx('action-bar')}>
                    <button className={cx('btn-cancel')}>Hủy đơn hàng</button>
                    <button className={cx('btn-confirm')}>Xác nhận đơn</button>
                </div>
            )}
        </div>
    );
};

export default OrderDetailPage;