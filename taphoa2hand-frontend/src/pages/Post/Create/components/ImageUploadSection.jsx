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
                const reader = new FileReader();
                reader.onload = (e) => {
                    previews[i] = e.target.result;
                    if (previews.filter(Boolean).length === images.length) {
                        setImagePreviews([...previews]);
                    }
                };
                reader.readAsDataURL(images[i]);
            }
        } else {
            setImagePreviews([]);
        }
    }, [images]);

    const removeImage = (index) => {
        const dt = new DataTransfer();
        const fileArray = Array.from(images);
        fileArray.splice(index, 1);
        fileArray.forEach(file => dt.items.add(file));
        // Re-trigger onFileChange by dispatching a new event
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.files = dt.files;
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', { value: input });
        onFileChange(event);
    };

    return (
        <section className={cx('card')}>
            <div className={cx('card-header')}>
                <div className={cx('card-icon', 'icon-image')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <div>
                    <h2 className={cx('card-title')}>Hình ảnh sản phẩm<span className={cx('required')}>*</span></h2>
                    <p className={cx('card-desc')}>Tải lên tối đa 10 hình ảnh chất lượng cao</p>
                </div>
            </div>
            <div className={cx('card-body')}>
                <input
                    className={cx('fileInput', { error: fieldErrors.images })}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onFileChange}
                />
                {fieldErrors.images && <span className={cx('errorText')}>{fieldErrors.images}</span>}
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94a3b8' }}>
                    Hỗ trợ JPG, PNG, WEBP. Tối đa 10 ảnh.
                </p>

                {imagePreviews.length > 0 && (
                    <div className={cx('imagePreviewContainer')}>
                        <p className={cx('previewTitle')}>Xem trước ({imagePreviews.length} ảnh)</p>
                        <div className={cx('imageGrid')}>
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className={cx('imagePreviewItem')}>
                                    <img src={preview} alt={`Ảnh ${index + 1}`} />
                                    <span className={cx('imageIndex')}>{index + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            left: 4,
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            background: 'rgba(239,68,68,0.85)',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 12,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            lineHeight: 1,
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ImageUploadSection;
