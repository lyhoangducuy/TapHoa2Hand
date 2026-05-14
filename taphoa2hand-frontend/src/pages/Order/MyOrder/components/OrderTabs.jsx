import React from 'react';
import classNames from 'classnames/bind';
import { FiShoppingCart, FiTrendingUp } from 'react-icons/fi';
import styles from '../MyOrderPage.module.scss';

const cx = classNames.bind(styles);

const OrderTabs = ({ activeTab, onTabChange }) => {
    return (
        <div className={cx('order-tabs')}>
            <div
                className={cx('tab-item', { active: activeTab === 'purchases' })}
                onClick={() => onTabChange('purchases')}
            >
                <FiShoppingCart size={20} />
                <span>Đơn mua</span>
            </div>
            <div
                className={cx('tab-item', { active: activeTab === 'sales' })}
                onClick={() => onTabChange('sales')}
            >
                <FiTrendingUp size={20} />
                <span>Đơn bán</span>
            </div>
        </div>
    );
};

export default OrderTabs;
