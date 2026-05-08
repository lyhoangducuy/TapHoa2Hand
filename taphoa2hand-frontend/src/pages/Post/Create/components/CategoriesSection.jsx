import React from "react";
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function CategoriesSection({ categories, listCategoriesId, fieldErrors, onCategoryToggle }) {
    return (
        <fieldset className={cx('fieldset')}>
            <legend className={cx('legend')}>Danh mục</legend>
            <div className={cx('checkboxGroup')}>
                {categories.map((cat) => (
                    <label key={cat.id} className={cx('checkboxLabel')}>
                        <input
                            type="checkbox"
                            checked={listCategoriesId.includes(cat.id.toString())}
                            onChange={() => onCategoryToggle(cat.id)}
                        /> {cat.name}
                    </label>
                ))}
            </div>
            {fieldErrors.categories && <span className={cx('errorText')}>{fieldErrors.categories}</span>}
        </fieldset>
    );
}

export default CategoriesSection;
