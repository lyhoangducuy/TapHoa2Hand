import React from 'react';
import classNames from 'classnames/bind';
import styles from './FeedbackPopup.module.scss';
import FeedbackForm from './FeedbackForm';

const cx = classNames.bind(styles);

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);

const FeedbackPopup = ({ order, feedback, mode = 'create', onSuccess, onCancel }) => {
    if (!order && !feedback) return null;

    const orderLabel = order
        ? `#${String(order.id || '').substring(0, 8).toUpperCase()}`
        : `#${String(feedback.orderId || '').substring(0, 8).toUpperCase()}`;

    const displayName = order?.sellerName || order?.sellerUsername || feedback?.targetUserName || 'Người bán';

    return (
        <div className={cx('popup-overlay')} onClick={onCancel}>
            <div className={cx('popup-content')} onClick={(e) => e.stopPropagation()}>
                {/* ORDER SUMMARY */}
                <div className={cx('order-summary')}>
                    <div className={cx('summary-row')}>
                        <span className={cx('summary-label')}>Đơn hàng</span>
                        <span className={cx('summary-value', 'mono')}>{orderLabel}</span>
                    </div>
                    {order?.postTitle && (
                        <div className={cx('summary-row')}>
                            <span className={cx('summary-label')}>Sản phẩm</span>
                            <span className={cx('summary-value')}>{order.postTitle}</span>
                        </div>
                    )}
                    {order?.postImageUrl && (
                        <div className={cx('summary-row')}>
                            <span className={cx('summary-label')}>Ảnh</span>
                            <img src={order.postImageUrl} alt="product" className={cx('summary-thumb')} />
                        </div>
                    )}
                    <div className={cx('summary-row')}>
                        <span className={cx('summary-label')}>Người bán</span>
                        <span className={cx('summary-value')}>{displayName}</span>
                    </div>
                    {order?.totalAmount != null && (
                        <div className={cx('summary-row')}>
                            <span className={cx('summary-label')}>Tổng tiền</span>
                            <span className={cx('summary-value', 'price')}>{formatCurrency(order.totalAmount)}</span>
                        </div>
                    )}
                    {order?.status && (
                        <div className={cx('summary-row')}>
                            <span className={cx('summary-label')}>Trạng thái</span>
                            <span className={cx('summary-value')}>{order.status?.displayName || order.status?.name}</span>
                        </div>
                    )}
                </div>

                {/* FEEDBACK FORM */}
                <FeedbackForm
                    order={order}
                    feedback={feedback}
                    mode={mode}
                    onSuccess={onSuccess}
                    onCancel={onCancel}
                />
            </div>
        </div>
    );
};

export default FeedbackPopup;
