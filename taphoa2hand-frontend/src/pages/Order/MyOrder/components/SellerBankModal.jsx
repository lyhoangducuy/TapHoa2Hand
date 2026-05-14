import React from 'react';
import classNames from 'classnames/bind';
import { FiDollarSign, FiX } from 'react-icons/fi';
import styles from '../MyOrderPage.module.scss';

const cx = classNames.bind(styles);

const SellerBankModal = ({ 
    show, 
    bankInfo, 
    onBankInfoChange, 
    onConfirm, 
    onCancel, 
    loading 
}) => {
    if (!show) return null;

    const { bankName, accountName, accountNumber } = bankInfo;

    return (
        <div className={cx('feedback-modal-overlay')} onClick={onCancel}>
            <div className={cx('feedback-modal')} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <FiDollarSign size={28} color="#2f3542" />
                    <h3 style={{ margin: '0 0 0 10px', color: '#2f3542', fontSize: '18px', fontWeight: '700' }}>
                        Nhập thông tin ngân hàng
                    </h3>
                </div>
                <div className={cx('form-section')}>
                    <input
                        type="text"
                        name="bankName"
                        value={bankName}
                        onChange={onBankInfoChange}
                        placeholder="Tên ngân hàng"
                    />
                    <input
                        type="text"
                        name="accountName"
                        value={accountName}
                        onChange={onBankInfoChange}
                        placeholder="Tên chủ tài khoản"
                    />
                    <input
                        type="text"
                        name="accountNumber"
                        value={accountNumber}
                        onChange={onBankInfoChange}
                        placeholder="Số tài khoản"
                    />
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
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? '⏳ Đang xử lý...' : 'Xác nhận đơn'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellerBankModal;
