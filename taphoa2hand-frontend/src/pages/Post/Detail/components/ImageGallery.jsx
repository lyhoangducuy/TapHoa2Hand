import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '../PostDetailPage.module.scss';

const cx = classNames.bind(styles);
const DEFAULT_IMAGE = 'https://via.placeholder.com/600x400?text=No+Image';

const ImageGallery = ({ images, status, postType }) => {
    const [activeImage, setActiveImage] = useState(images?.[0]?.imageUrl || DEFAULT_IMAGE);

    useEffect(() => {
        if (images && images.length > 0) {
            const thumbnail = images.find(img => img.isThumbnail);
            setActiveImage(thumbnail ? thumbnail.imageUrl : images[0].imageUrl);
        }
    }, [images]);

    // Helper lấy displayName cho status
    const getStatusDisplay = () => {
        if (!status) return 'Đang bán';
        if (typeof status === 'object') {
            return status.displayName || status.name || 'Đang bán';
        }
        return status === 'AVAILABLE' ? 'Đang bán' : status;
    };

    // Helper lấy displayName cho postType
    const getPostTypeDisplay = () => {
        if (!postType) return null;
        if (typeof postType === 'object') {
            return postType.displayName || postType.name;
        }
        return postType;
    };

    return (
        <div className={cx('image-section')}>
            <div className={cx('main-img-box')}>
                <img src={activeImage} alt="Main" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
                
                {/* Hiển thị postType badge */}
                {getPostTypeDisplay() && (
                    <span className={cx('type-tag', postType?.name?.toLowerCase() || 'sell')}>
                        {getPostTypeDisplay()}
                    </span>
                )}
                
                {/* Hiển thị status badge */}
                <span className={cx('status-tag', typeof status === 'object' ? status?.name?.toLowerCase() : status?.toLowerCase())}>
                    {getStatusDisplay()}
                </span>
            </div>
            <div className={cx('thumb-row')}>
                {images && images.map((img) => (
                    <img
                        key={img.id}
                        src={img.imageUrl}
                        className={cx({ active: activeImage === img.imageUrl })}
                        onClick={() => setActiveImage(img.imageUrl)}
                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                        alt="Thumbnail"
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;