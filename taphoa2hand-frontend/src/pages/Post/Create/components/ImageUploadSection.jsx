import React, { useState, useEffect } from "react";
import classNames from 'classnames/bind';
import styles from '../CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function ImageUploadSection({ images, fieldErrors, onFileChange }) {
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        if (images && images.length > 0) {
            const previews = [];
            for (let i = 0; i < images.length; i++) {
                const file = images[i];
                const reader = new FileReader();
                reader.onload = (e) => {
                    previews[i] = e.target.result;
                    if (previews.filter(Boolean).length === images.length) {
                        setImagePreviews([...previews]);
                    }
                };
                reader.readAsDataURL(file);
            }
        } else {
            setImagePreviews([]);
        }
    }, [images]);

    return (
        <fieldset className={cx('fieldset')}>
            <legend className={cx('legend')}>Hình ảnh sản phẩm</legend>
            <div className={cx('formGroup')}>
                <input
                    className={cx('fileInput', { error: fieldErrors.images })}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onFileChange}
                />
                {fieldErrors.images && <span className={cx('errorText')}>{fieldErrors.images}</span>}
                <small className={cx('helperText')}>
                    Bạn có thể chọn nhiều ảnh cùng lúc. (Tối đa 10 ảnh)
                </small>
            </div>

            {imagePreviews.length > 0 && (
                <div className={cx('imagePreviewContainer')}>
                    <h4 className={cx('previewTitle')}>Xem trước ảnh ({imagePreviews.length})</h4>
                    <div className={cx('imageGrid')}>
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className={cx('imagePreviewItem')}>
                                <img src={preview} alt={`Preview ${index + 1}`} />
                                <span className={cx('imageIndex')}>{index + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </fieldset>
    );
}

export default ImageUploadSection;
