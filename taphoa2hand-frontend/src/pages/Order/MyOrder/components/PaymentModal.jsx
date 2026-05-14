import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { FiCreditCard, FiX } from 'react-icons/fi';
import styles from '../MyOrderPage.module.scss';
import axios from 'axios'; // Nhớ import thư viện gọi API của bạn
import { getToken } from '../../../../services/localStorageService';

const cx = classNames.bind(styles);

const PaymentModal = ({ 
    show, 
    orderId, 
    amount, // BƯỚC 1: Nhận thêm prop số tiền
    onCancel 
}) => {
    const [loading, setLoading] = useState(false);

    if (!show || !orderId || !amount) return null;

    // Đổi tên hàm cho đúng với VNPay
    const handleVNPayPayment = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await axios.get('http://localhost:8080/payment/vn-pay', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    amount: amount,
                    orderId: orderId,
                }
            });
            
            // BƯỚC 3: Lấy link từ backend và chuyển hướng người dùng
            // Dựa vào cấu trúc ApiResponse bạn định nghĩa ở Backend
            if (response.data && response.data.result && response.data.result.paymentUrl) {
                window.location.href = response.data.result.paymentUrl;
            } else {
                alert("Không lấy được đường dẫn thanh toán!");
            }
        } catch (error) {
            console.error("Lỗi khi tạo giao dịch VNPay:", error);
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
                        <FiCreditCard size={32} color="#0068FF" /> 
                        <h3 style={{ margin: '0 0 0 10px', color: '#2f3542', fontSize: '18px', fontWeight: '700' }}>
                            Thanh toán qua VNPay
                        </h3>
                    </div>
                    
                    <p style={{ marginBottom: '5px', color: '#666' }}>
                        Mã đơn: <strong>#{orderId?.substring(0, 8).toUpperCase()}</strong>
                    </p>
                    {/* Hiển thị thêm số tiền để người dùng xác nhận */}
                    <p style={{ marginBottom: '15px', color: '#d63031', fontWeight: 'bold', fontSize: '18px' }}>
                        Tổng tiền: {amount.toLocaleString('vi-VN')} VNĐ
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
                            Bạn sẽ được chuyển hướng sang cổng thanh toán an toàn của VNPay.
                        </p>
                    </div>
                </div>

                <div className={cx('modal-actions')}>
                    <button className={cx('btn', 'btn-cancel')} onClick={onCancel} disabled={loading}>
                        <FiX size={18} /> Hủy
                    </button>
                    <button 
                        className={cx('btn', 'btn-primary')} 
                        onClick={handleVNPayPayment} // Gọi hàm thanh toán
                        disabled={loading}
                    >
                        {loading ? '⏳ Đang kết nối...' : 'Chuyển tới VNPay'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;