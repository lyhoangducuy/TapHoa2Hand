import React from "react";
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function PaymentMethodsSection({ payments, acceptedPaymentMethods, fieldErrors, onPaymentToggle }) {
    return (
        <section className={cx('card')}>
            <div className={cx('card-header')}>
                <div className={cx('card-icon', 'icon-pay')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <div>
                    <h2 className={cx('card-title')}>Phương thức thanh toán <span className={cx('required')}>*</span></h2>
                    <p className={cx('card-desc')}>Chọn hình thức thanh toán bạn chấp nhận</p>
                </div>
            </div>
            <div className={cx('card-body')}>
                <div className={cx('checkboxGroup')}>
                    {(payments || []).map((pay) => (
                        <label key={pay.name} className={cx('checkboxLabel')}>
                            <input
                                type="checkbox"
                                checked={acceptedPaymentMethods.some(p => p.name === pay.name)}
                                onChange={() => onPaymentToggle(pay)}
                            />
                            {pay.description}
                        </label>
                    ))}
                </div>
                {fieldErrors.payments && <span className={cx('errorText')}>{fieldErrors.payments}</span>}
            </div>
        </section>
    );
}

export default PaymentMethodsSection;
