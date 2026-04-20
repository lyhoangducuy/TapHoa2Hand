import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '../PostDetailPage.module.scss';

const cx = classNames.bind(styles);
const DEFAULT_IMAGE = 'https://via.placeholder.com/600x400?text=No+Image';

const ImageGallery = ({ images, status }) => {
    const [activeImage, setActiveImage] = useState(images?.[0]?.imageUrl || DEFAULT_IMAGE);

    useEffect(() => {
        if (images && images.length > 0) {
            const thumbnail = images.find(img => img.isThumbnail);
            setActiveImage(thumbnail ? thumbnail.imageUrl : images[0].imageUrl);
        }
    }, [images]);

    return (
        <div className={cx('image-section')}>
            <div className={cx('main-img-box')}>
                <img src={activeImage} alt="Main" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
                <span className={cx('status-tag', status?.toLowerCase())}>
                    {status === 'AVAILABLE' ? 'Đang bán' : status}
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