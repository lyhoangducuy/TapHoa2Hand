import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { FiCreditCard, FiX } from 'react-icons/fi';
import styles from '../MyOrderPage.module.scss';
// Nhớ import thư viện gọi API của bạn (axios hoặc fetch custom)
// import api from 'path/to/your/api'; 

const cx = classNames.bind(styles);

const PaymentModal = ({ 
    show, 
    orderId, 
    onCancel 
}) => {
    const [loading, setLoading] = useState(false);

    if (!show || !orderId) return null;

    // Hàm xử lý khi bấm nút Thanh toán qua ZaloPay
    const handleZaloPayPayment = async () => {
        setLoading(true);
        try {
            // GỌI API BACKEND ĐỂ LẤY LINK ZALOPAY
            // Thay thế endpoint này bằng endpoint thực tế của bạn
            // const response = await api.post(`/payment/zalopay/create/${orderId}`);
            
            // Giả sử response trả về có chứa order_url
            // if (response.data && response.data.result.order_url) {
            //     window.location.href = response.data.result.order_url; // Chuyển hướng user
            // }

            // Demo log
            console.log("Gọi API lấy link ZaloPay cho Order:", orderId);
            alert("Sẽ chuyển hướng sang ZaloPay ngay bây giờ!");
            
        } catch (error) {
            console.error("Lỗi khi tạo giao dịch ZaloPay:", error);
            alert("Có lỗi xảy ra khi kết nối cổng thanh toán.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('feedback-modal-overlay')} onClick={onCancel}>
            <div className={cx('feedback-modal')} onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <FiCreditCard size={32} color="#0068FF" /> {/* Đổi màu xanh ZaloPay */}
                        <h3 style={{ margin: '0 0 0 10px', color: '#2f3542', fontSize: '18px', fontWeight: '700' }}>
                            Thanh toán qua ZaloPay
                        </h3>
                    </div>
                    
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        Mã đơn: <strong>#{orderId?.substring(0, 8).toUpperCase()}</strong>
                    </p>
                    
                    <div style={{
                        backgroundColor: '#e6f0ff',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        color: '#003380',
                        border: '1px solid #b3d4ff'
                    }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>Xác nhận thanh toán</p>
                        <p style={{ margin: '10px 0 0 0' }}>
                            Bạn sẽ được chuyển hướng sang cổng thanh toán an toàn của ZaloPay. Có thể thanh toán bằng <strong>Ví ZaloPay</strong>, <strong>Thẻ ATM</strong> hoặc <strong>Thẻ tín dụng</strong>.
                        </p>
                    </div>
                </div>

                <div className={cx('modal-actions')}>
                    <button
                        className={cx('btn', 'btn-cancel')}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        <FiX size={18} />
                        Hủy
                    </button>
                    <button
                        className={cx('btn', 'btn-primary')}
                        onClick={handleZaloPayPayment}
                        disabled={loading}
                        style={{ backgroundColor: '#0068FF', borderColor: '#0068FF' }} // Nút xanh ZaloPay
                    >
                        {loading ? '⏳ Đang kết nối...' : 'Chuyển tới ZaloPay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;