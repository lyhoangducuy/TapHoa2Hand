import React from "react";
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function ProductDetailsSection({ postDetail, fieldErrors, onDetailChange, postTypeName = 'SELL' }) {
    const isSellPost = postTypeName === 'SELL';

    return (
        <section className={cx('card')}>
            <div className={cx('card-header')}>
                <div className={cx('card-icon', 'icon-detail')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                    <h2 className={cx('card-title')}>Chi tiết sản phẩm</h2>
                    <p className={cx('card-desc')}>Mô tả đầy đủ thông tin sản phẩm<span className={cx('required')}>*</span></p>
                </div>
            </div>
            <div className={cx('card-body')}>
                <div className={cx('grid2Cols')}>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Thương hiệu<span className={cx('required')}>*</span></label>
                        <input
                            className={cx('inputControl')}
                            name="brand"
                            value={postDetail.brand}
                            onChange={onDetailChange}
                            placeholder="Ví dụ: Apple, Samsung..."
                        />
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Dòng sản phẩm<span className={cx('required')}>*</span></label>
                        <input
                            className={cx('inputControl')}
                            name="model"
                            value={postDetail.model}
                            onChange={onDetailChange}
                            placeholder="Ví dụ: iPhone 14 Pro Max"
                        />
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Tình trạng <span className={cx('required')}>*</span></label>
                        <input
                            className={cx('inputControl', { error: fieldErrors.itemCondition })}
                            name="itemCondition"
                            value={postDetail.itemCondition}
                            onChange={onDetailChange}
                            placeholder="Ví dụ: Mới 90%, Đã sử dụng 1 năm..."
                        />
                        {fieldErrors.itemCondition && <span className={cx('errorText')}>{fieldErrors.itemCondition}</span>}
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Thời gian đã sử dụng<span className={cx('required')}>*</span></label>
                        <input
                            className={cx('inputControl')}
                            name="usedDuration"
                            value={postDetail.usedDuration}
                            onChange={onDetailChange}
                            placeholder="Ví dụ: 6 tháng, 2 năm..."
                        />
                    </div>
                </div>

                {isSellPost && (
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Lý do bán<span className={cx('required')}>*</span></label>
                        <input
                            className={cx('inputControl')}
                            name="reasonForSelling"
                            value={postDetail.reasonForSelling}
                            onChange={onDetailChange}
                            placeholder="Ví dụ: Không sử dụng nữa, chuyển sang model mới..."
                        />
                    </div>
                )}

                <div className={cx('formGroup')}>
                    <label className={cx('label')}>Mô tả chi tiết <span className={cx('required')}>*</span></label>
                    <textarea
                        className={cx('textareaControl', { error: fieldErrors.description })}
                        name="description"
                        value={postDetail.description}
                        onChange={onDetailChange}
                        rows="4"
                        placeholder="Mô tả chi tiết về sản phẩm: tính năng, tình trạng, phụ kiện đi kèm..."
                    />
                    {fieldErrors.description && <span className={cx('errorText')}>{fieldErrors.description}</span>}
                </div>
            </div>
        </section>
    );
}

export default ProductDetailsSection;
