import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import classNames from 'classnames/bind';
import styles from './PaymentCallback.module.scss'; // Bạn tự tạo file css/scss tương ứng nhé

const cx = classNames.bind(styles);

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

    useEffect(() => {
        // Lấy mã phản hồi từ VNPay trên URL
        const responseCode = searchParams.get('vnp_ResponseCode');
        const orderId = searchParams.get('vnp_TxnRef'); // Mã đơn hàng (nếu bạn dùng vnp_TxnRef để lưu orderId)

        if (responseCode) {
            if (responseCode === '00') {
                setStatus('success');
                // Gọi API backend (nếu cần) để báo backend cập nhật trạng thái đơn hàng
                // orderService.verifyPayment(searchParams.toString());
            } else {
                setStatus('error');
            }
        } else {
            setStatus('error');
        }
    }, [searchParams]);

    const handleGoBack = () => {
        // Quay lại trang quản lý đơn hàng
        navigate('/my-orders?tab=purchases');
    };

    return (
        <div className={cx('callback-wrapper')}>
            <div className={cx('callback-card')}>
                {status === 'loading' && (
                    <div className={cx('content')}>
                        <FiLoader size={48} className={cx('icon-spin')} />
                        <h2>Đang xử lý kết quả thanh toán...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className={cx('content', 'success')}>
                        <FiCheckCircle size={64} color="#28a745" />
                        <h2>Thanh toán thành công!</h2>
                        <p>Đơn hàng của bạn đã được ghi nhận thanh toán.</p>
                        <button className={cx('btn', 'btn-primary')} onClick={handleGoBack}>
                            Quay lại đơn hàng
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className={cx('content', 'error')}>
                        <FiXCircle size={64} color="#dc3545" />
                        <h2>Thanh toán thất bại hoặc đã bị hủy!</h2>
                        <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
                        <button className={cx('btn', 'btn-secondary')} onClick={handleGoBack}>
                            Quay lại đơn hàng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;