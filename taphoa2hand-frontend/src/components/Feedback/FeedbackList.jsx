import React from 'react';
import classNames from 'classnames/bind';
import styles from './FeedbackList.module.scss';
import RatingDisplay from './RatingDisplay';

const cx = classNames.bind(styles);

const FeedbackList = ({ feedbacks = [], loading = false }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className={cx('feedback-list')}>
                <div className={cx('loading')}>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!feedbacks || feedbacks.length === 0) {
        return (
            <div className={cx('feedback-list')}>
                <div className={cx('empty')}>
                    <p>Chưa có đánh giá</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('feedback-list')}>
            {feedbacks.map((feedback) => (
                <div key={feedback.id} className={cx('feedback-item')}>
                    <div className={cx('feedback-header')}>
                        <div className={cx('reviewer-info')}>
                            <h4 className={cx('reviewer-name')}>
                                {feedback.reviewerName}
                            </h4>
                            <p className={cx('feedback-date')}>
                                {formatDate(feedback.createdAt)}
                            </p>
                        </div>
                        <div className={cx('rating')}>
                            <RatingDisplay 
                                rating={feedback.rating} 
                                showText={false}
                            />
                            <span className={cx('rating-value')}>
                                {feedback.rating}/5
                            </span>
                        </div>
                    </div>

                    {feedback.comment && (
                        <div className={cx('feedback-comment')}>
                            <p>{feedback.comment}</p>
                        </div>
                    )}

                    {feedback.mediaList && feedback.mediaList.length > 0 && (
                        <div className={cx('feedback-images')}>
                            {feedback.mediaList.map((media) => (
                                <img
                                    key={media.id || media.url}
                                    src={media.url}
                                    alt="Feedback"
                                    loading="lazy"
                                />
                            ))}
                        </div>
                    )}

                    {feedback.imageUrl && !feedback.mediaList && (
                        <div className={cx('feedback-image')}>
                            <img 
                                src={feedback.imageUrl} 
                                alt="Feedback" 
                                loading="lazy"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FeedbackList;
