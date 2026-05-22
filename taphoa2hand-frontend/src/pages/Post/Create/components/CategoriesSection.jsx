import React from "react";
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function CategoriesSection({ categories, listCategoriesId, fieldErrors, onCategoryToggle }) {
    return (
        <section className={cx('card')}>
            <div className={cx('card-header')}>
                <div className={cx('card-icon', 'icon-category')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/></svg>
                </div>
                <div>
                    <h2 className={cx('card-title')}>Danh mục</h2>
                    <p className={cx('card-desc')}>Chọn danh mục phù hợp cho sản phẩm</p>
                </div>
            </div>
            <div className={cx('card-body')}>
                <div className={cx('checkboxGroup')}>
                    {(categories || []).map((cat) => (
                        <label key={cat.id} className={cx('checkboxLabel')}>
                            <input
                                type="checkbox"
                                checked={listCategoriesId.includes(cat.id.toString())}
                                onChange={() => onCategoryToggle(cat.id)}
                            />
                            {cat.name}
                        </label>
                    ))}
                </div>
                {fieldErrors.categories && <span className={cx('errorText')}>{fieldErrors.categories}</span>}
            </div>
        </section>
    );
}

export default CategoriesSection;
