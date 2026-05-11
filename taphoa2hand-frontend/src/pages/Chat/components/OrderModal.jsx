import React from 'react';
import classNames from 'classnames/bind';
import styles from '../ChatPage.module.scss';

const cx = classNames.bind(styles);

const formatPrice = (price) => {
    if (!price && price !== 0) return 'Thỏa thuận';
    const num = Number(price);
    if (isNaN(num)) return price;
    return num.toLocaleString('vi-VN') + ' đ';
};

function OrderModal({ 
    currentChat, 
    orderForm, 
    handleOrderFormChange, 
    submitOrderRequest, 
    isSubmittingOrder, 
    createdOrder,
    onCheckout,
    close 
}) {

    // Nếu đã tạo order thành công, hiển thị thông tin order và nút checkout
    if (createdOrder) {
        return (
            <div className={cx('modal-overlay')}>
                <div className={cx('modal-content')}>
                    <h2>🎉 Đơn Hàng Đã Tạo</h2>
                    <div className={cx('product-summary')}>
                        <strong>Sản phẩm:</strong> {currentChat?.postTitle} <br />
                        <strong>Giá:</strong> <span>{formatPrice(currentChat?.postPrice)}</span>
                    </div>
                    
                    <div className={cx('order-info-section')}>
                        <h3>Thông tin đơn hàng</h3>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Mã đơn hàng:</span>
                            <span className={cx('value')}>{createdOrder.id || 'Đang xử lý...'}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Người nhận:</span>
                            <span className={cx('value')}>{createdOrder.receiverName}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Số điện thoại:</span>
                            <span className={cx('value')}>{createdOrder.receiverPhone}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Địa chỉ:</span>
                            <span className={cx('value')}>{createdOrder.shippingAddress}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Phương thức:</span>
                            <span className={cx('value')}>
                                {createdOrder.method === 'MIDDLEMAN' ? 'Giao dịch qua Trung gian' : 'Giao dịch Trực tiếp'}
                            </span>
                        </div>
                    </div>

                    <div className={cx('modal-actions')}>
                        <button 
                            type="button" 
                            onClick={close} 
                            className={cx('btn-cancel')}
                        >
                            Đóng
                        </button>
                        <button 
                            type="button" 
                            onClick={onCheckout} 
                            className={cx('btn-submit')}
                        >
                            💳 Thanh toán ngay
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Form tạo order
    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('modal-content')}>
                <h2>Yêu Cầu Giao Dịch</h2>
                <div className={cx('product-summary')}>
                    <strong>Sản phẩm:</strong> {currentChat?.postTitle} <br />
                    <strong>Giá:</strong> <span>{formatPrice(currentChat?.postPrice)}</span>
                </div>
                <form onSubmit={submitOrderRequest}>
                    <div className={cx('form-section')}>
                        <strong>1. Thông tin nhận hàng</strong>
                        <input 
                            required 
                            type="text" 
                            name="receiverName" 
                            value={orderForm.receiverName} 
                            onChange={handleOrderFormChange} 
                            placeholder="Tên người nhận" 
                        />
                        <input 
                            required 
                            type="text" 
                            name="receiverPhone" 
                            value={orderForm.receiverPhone} 
                            onChange={handleOrderFormChange} 
                            placeholder="Số điện thoại" 
                        />
                        <textarea 
                            required 
                            name="shippingAddress" 
                            value={orderForm.shippingAddress} 
                            onChange={handleOrderFormChange} 
                            placeholder="Địa chỉ giao hàng..." 
                        />
                    </div>
                    <div className={cx('form-section')}>
                        <strong>2. Phương thức giao dịch</strong>
                        <select name="method" value={orderForm.method} onChange={handleOrderFormChange}>
                            <option value="MIDDLEMAN">Giao dịch qua Trung gian (An toàn)</option>
                            <option value="DIRECT">Giao dịch Trực tiếp (Tự thỏa thuận)</option>
                        </select>
                    </div>
                    {orderForm.method === 'MIDDLEMAN' && (
                        <div className={cx('form-section')}>
                            <strong>3. Thông tin tài khoản ngân hàng</strong>
                            <input
                                required
                                type="text"
                                name="buyerBank.bankName"
                                value={orderForm.buyerBank.bankName}
                                onChange={handleOrderFormChange}
                                placeholder="Tên ngân hàng"
                            />
                            <input
                                required
                                type="text"
                                name="buyerBank.accountName"
                                value={orderForm.buyerBank.accountName}
                                onChange={handleOrderFormChange}
                                placeholder="Tên chủ tài khoản"
                            />
                            <input
                                required
                                type="text"
                                name="buyerBank.accountNumber"
                                value={orderForm.buyerBank.accountNumber}
                                onChange={handleOrderFormChange}
                                placeholder="Số tài khoản"
                            />
                        </div>
                    )}
                    <div className={cx('modal-actions')}>
                        <button 
                            type="button" 
                            onClick={close} 
                            className={cx('btn-cancel')}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmittingOrder} 
                            className={cx('btn-submit')}
                        >
                            {isSubmittingOrder ? 'Đang gửi...' : 'Xác nhận tạo đơn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OrderModal;