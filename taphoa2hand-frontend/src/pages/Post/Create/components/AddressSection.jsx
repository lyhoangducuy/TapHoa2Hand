import React from "react";
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function AddressSection({ postAddress, fieldErrors, onAddressChange }) {
    return (
        <fieldset className={cx('fieldset')}>
            <legend className={cx('legend')}>Địa chỉ người bán</legend>
            <div className={cx('grid2Cols')}>
                <div className={cx('formGroup')}>
                    <label>Tỉnh / Thành phố:</label>
                    <input 
                        className={cx('inputControl', { error: fieldErrors.city })} 
                        name="city" 
                        value={postAddress.city} 
                        onChange={onAddressChange}
                    />
                    {fieldErrors.city && <span className={cx('errorText')}>{fieldErrors.city}</span>}
                </div>
                <div className={cx('formGroup')}>
                    <label>Quận / Huyện / Phường / Xã:</label>
                    <input 
                        className={cx('inputControl', { error: fieldErrors.ward })} 
                        name="ward" 
                        value={postAddress.ward} 
                        onChange={onAddressChange}
                    />
                    {fieldErrors.ward && <span className={cx('errorText')}>{fieldErrors.ward}</span>}
                </div>
            </div>
            <div className={cx('formGroup')}>
                <label>Số nhà / Tên đường:</label>
                <input 
                    className={cx('inputControl', { error: fieldErrors.street })} 
                    name="street" 
                    value={postAddress.street} 
                    onChange={onAddressChange}
                />
                {fieldErrors.street && <span className={cx('errorText')}>{fieldErrors.street}</span>}
            </div>
        </fieldset>
    );
}

export default AddressSection;
