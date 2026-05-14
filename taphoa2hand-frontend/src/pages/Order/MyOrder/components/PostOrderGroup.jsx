import React from 'react';
import classNames from 'classnames/bind';
import OrderCard from './OrderCard';
import styles from '../MyOrderPage.module.scss';

const cx = classNames.bind(styles);

const PostOrderGroup = ({ 
    group,
    activeTab,
    onFeedback,
    onPayment,
    onReject,
    onApprove,
    onPaymentConfirmed,
    onShipping,
    onDelivered,
    actionLoading
}) => {
    return (
        <div className={cx('post-order-group')}>
            <div className={cx('post-group-header')}>
                {group.postImageUrl ? (
                    <img
                        className={cx('post-thumb')}
                        src={group.postImageUrl}
                        alt={group.postTitle}
                    />
                ) : (
                    <div className={cx('post-thumb', 'placeholder')}>📦</div>
                )}
                <div className={cx('post-group-meta')}>
                    <h3 className={cx('post-group-title')}>
                        {group.postTitle || 'Tin đăng'}
                    </h3>
                    <p className={cx('post-group-sub')}>
                        {group.orders.length} đơn — thứ tự theo lúc tạo
                    </p>
                </div>
            </div>
            <div className={cx('post-group-orders')}>
                {group.orders.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        activeTab={activeTab}
                        onFeedback={onFeedback}
                        onPayment={onPayment}
                        onReject={onReject}
                        onApprove={onApprove}
                        onPaymentConfirmed={onPaymentConfirmed}
                        onShipping={onShipping}
                        onDelivered={onDelivered}
                        actionLoading={actionLoading}
                    />
                ))}
            </div>
        </div>
    );
};

export default PostOrderGroup;
