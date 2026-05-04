import React from 'react';
import classNames from 'classnames/bind';
import styles from './RatingDisplay.module.scss';

const cx = classNames.bind(styles);

const RatingDisplay = ({ rating, count, averageRating, showText = true }) => {
    const renderStars = (rate) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={cx('star', { filled: i <= rate })}>
                    ★
                </span>
            );
        }
        return stars;
    };

    const displayRating = rating || averageRating || 0;

    return (
        <div className={cx('rating-display')}>
            <div className={cx('stars')}>
                {renderStars(Math.round(displayRating))}
            </div>
            {showText && (
                <div className={cx('rating-info')}>
                    <span className={cx('rating-value')}>
                        {displayRating.toFixed(1)}
                    </span>
                    {count !== undefined && (
                        <span className={cx('rating-count')}>
                            ({count} đánh giá)
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default RatingDisplay;
