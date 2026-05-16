import React from 'react';
import classNames from 'classnames/bind';
import { FiFilter } from 'react-icons/fi';
import styles from '../MyOrderPage.module.scss';

const cx = classNames.bind(styles);

const OrderFilters = ({ 
    selectedStatus, 
    selectedPaymentMethod, 
    onStatusChange, 
    onPaymentChange 
}) => {
    return (
        <div className={cx('filter-row')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
                <FiFilter size={18} />
                <label className={cx('filter-label')}>Trạng thái:</label>
            </div>
            <select 
                className={cx('status-select')} 
                value={selectedStatus} 
                onChange={onStatusChange}
            >
                <option value={'ALL'}>Tất cả</option>
                <option value={'PENDING'}>Chờ xác nhận</option>
                <option value={'CONFIRMED'}>Đã xác nhận, chờ thanh toán</option>
                <option value={'PAID_WAITING_PICKUP'}>Đã thanh toán, chờ lấy hàng</option>
                <option value={'SHIPPING'}>Đang giao</option>
                <option value={'DELIVERED'}>Đã giao</option>
                <option value={'SETTLING'}>Đang giải ngân</option>
                <option value={'COMPLETED'}>Hoàn tất</option>
                <option value={'CANCELLED'}>Đã hủy</option>
                <option value={'RETURNED'}>Trả hàng</option>
                <option value={'CANCELLED_AUTO'}>Đã hủy tự động</option>
                <option value={'REPORTED'}>Đang có tranh chấp</option>
            </select>

            <label className={cx('filter-label')} style={{ marginLeft: '20px' }}>Thanh toán:</label>
            <select 
                className={cx('status-select')} 
                value={selectedPaymentMethod} 
                onChange={onPaymentChange}
            >
                <option value={'ALL'}>Tất cả</option>
                <option value={'DIRECT'}>Trực tiếp</option>
                <option value={'MIDDLEMAN'}>Trung gian</option>
            </select>
        </div>
    );
};

export default OrderFilters;
