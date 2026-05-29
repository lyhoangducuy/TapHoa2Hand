import React from "react";
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function BasicInfoSection({ formData, postTypes, fieldErrors, onBasicChange }) {
    return (
        <fieldset className={cx('fieldset')}>
            <legend className={cx('legend')}>Thông tin cơ bản</legend>
            <div className={cx('formGroup')}>
                <label>Loại tin: </label>
                
                <select 
                    className={cx('inputControl')} 
                    name="postTypeName" 
                    value={formData.postTypeName} 
                    onChange={onBasicChange}
                    required
                >
                    
                    {postTypes.map((type) => (
                        <option key={type.name} value={type.name}>
                            {type.displayName}
                        </option>
                    ))}
                </select>
                
            </div>
            <div className={cx('formGroup')}>
                <label>Tiêu đề: <span className={cx('required')}>*</span></label>
                <input 
                    className={cx('inputControl', { error: fieldErrors.title })} 
                    name="title" 
                    value={formData.title} 
                    onChange={onBasicChange} 
                    required 
                />
                {fieldErrors.title && <span className={cx('errorText')}>{fieldErrors.title}</span>}
            </div>
            <div className={cx('formGroup')}>
                <label>Giá (VNĐ):</label>
                <input 
                    className={cx('inputControl', { error: fieldErrors.price })} 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={onBasicChange} 
                    required 
                />
                {fieldErrors.price && <span className={cx('errorText')}>{fieldErrors.price}</span>}
            </div>
        </fieldset>
    );
}

export default BasicInfoSection;
