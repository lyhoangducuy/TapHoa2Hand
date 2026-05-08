import React from "react";
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function ProductDetailsSection({ postDetail, fieldErrors, onDetailChange }) {
    return (
        <fieldset className={cx('fieldset')}>
            <legend className={cx('legend')}>Chi tiết sản phẩm</legend>
            <div className={cx('grid2Cols')}>
                <div className={cx('formGroup')}>
                    <label>Thương hiệu:</label>
                    <input 
                        className={cx('inputControl')} 
                        name="brand" 
                        value={postDetail.brand} 
                        onChange={onDetailChange}
                    />
                </div>
                <div className={cx('formGroup')}>
                    <label>Model:</label>
                    <input 
                        className={cx('inputControl')} 
                        name="model" 
                        value={postDetail.model} 
                        onChange={onDetailChange}
                    />
                </div>
                <div className={cx('formGroup')}>
                    <label>Tình trạng:</label>
                    <input 
                        className={cx('inputControl', { error: fieldErrors.itemCondition })} 
                        name="itemCondition" 
                        value={postDetail.itemCondition} 
                        onChange={onDetailChange}
                        placeholder="Ví dụ: Mới 90%"
                    />
                    {fieldErrors.itemCondition && <span className={cx('errorText')}>{fieldErrors.itemCondition}</span>}
                </div>
                <div className={cx('formGroup')}>
                    <label>Thời gian đã sử dụng:</label>
                    <input 
                        className={cx('inputControl')} 
                        name="usedDuration" 
                        value={postDetail.usedDuration} 
                        onChange={onDetailChange}
                        placeholder="Ví dụ: 6 tháng"
                    />
                </div>
            </div>
            <div className={cx('formGroup')}>
                <label>Lý do bán:</label>
                <input 
                    className={cx('inputControl')} 
                    name="reasonForSelling" 
                    value={postDetail.reasonForSelling} 
                    onChange={onDetailChange}
                />
            </div>
            <div className={cx('formGroup')}>
                <label>Mô tả chi tiết:</label>
                <textarea 
                    className={cx('textareaControl', { error: fieldErrors.description })} 
                    name="description" 
                    value={postDetail.description} 
                    onChange={onDetailChange}
                    rows="4"
                ></textarea>
                {fieldErrors.description && <span className={cx('errorText')}>{fieldErrors.description}</span>}
            </div>
        </fieldset>
    );
}

export default ProductDetailsSection;
