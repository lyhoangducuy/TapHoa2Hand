import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import styles from './FeedbackForm.module.scss';
import * as feedbackService from '../../services/feedbackService';

const cx = classNames.bind(styles);

const FeedbackForm = ({ orderId, onSuccess, onCancel, targetUserName }) => {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating < 1 || rating > 5) {
            toast.error('Vui lòng chọn số sao hợp lệ (1-5)');
            return;
        }

        setLoading(true);

        try {
            const feedbackData = {
                orderId,
                rating,
                comment: comment.trim()
            };

            const response = await feedbackService.createFeedback(
                feedbackData,
                images
            );

            toast.success('Tạo đánh giá thành công!');
            onSuccess?.(response.result);

        } catch (error) {
            console.error('Lỗi khi tạo feedback:', error);
            toast.error(error.message || 'Không thể tạo đánh giá');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('feedback-form')}>
            <div className={cx('form-header')}>
                <h3>Đánh giá {targetUserName}</h3>
                <button className={cx('close-btn')} onClick={onCancel}>
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit}>

                {/* STAR */}
                <div className={cx('form-group')}>
                    <label>Số sao</label>
                    <div className={cx('rating-stars')}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={cx('star', {
                                    active: star <= (hoverRating || rating)
                                })}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <div>{rating}/5</div>
                </div>

                {/* COMMENT */}
                <div className={cx('form-group')}>
                    <label>Bình luận</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm..."
                    />
                    <div>{comment.length}/500</div>
                </div>

                {/* IMAGES */}
                <div className={cx('form-group')}>
                    <label>Hình ảnh (optional)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setImages([...e.target.files])}
                    />
                </div>

                {/* ACTIONS */}
                <div className={cx('form-actions')}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default FeedbackForm;