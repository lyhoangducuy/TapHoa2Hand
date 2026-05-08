import React from "react";
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function PaymentMethodsSection({ payments, acceptedPaymentMethods, fieldErrors, onPaymentToggle }) {
    return (
        <fieldset className={cx('fieldset')}>
            <legend className={cx('legend')}>Phương thức thanh toán chấp nhận</legend>
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
        </fieldset>
    );
}

export default PaymentMethodsSection;
