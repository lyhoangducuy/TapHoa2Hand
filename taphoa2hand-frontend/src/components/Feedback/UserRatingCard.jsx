import React from 'react';
import classNames from 'classnames/bind';
import styles from './UserRatingCard.module.scss';
import { FiStar } from 'react-icons/fi';

const cx = classNames.bind(styles);

const UserRatingCard = ({ rating = 0, totalReviews = 0 }) => {

    const renderStars = (value) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <FiStar
                key={i}
                className={cx('star', i < Math.round(value) ? 'active' : '')}
            />
        ));
    };

    return (
        <div className={cx('rating-card')}>
            <div className={cx('rating-number')}>
                {rating ? rating.toFixed(1) : '0.0'}
            </div>

            <div className={cx('stars')}>
                {renderStars(rating)}
            </div>

            <div className={cx('review-count')}>
                {totalReviews} đánh giá
            </div>
        </div>
    );
};

export default UserRatingCard;