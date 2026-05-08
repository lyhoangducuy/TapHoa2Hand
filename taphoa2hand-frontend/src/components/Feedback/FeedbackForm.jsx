import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import styles from './FeedbackForm.module.scss';
import * as feedbackService from '../../services/feedbackService';

const cx = classNames.bind(styles);

const FeedbackForm = ({ orderId, onSuccess, onCancel, targetUserName }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

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
                comment: comment.trim(),
                imageUrl: imageUrl.trim()
            };

            console.log('Gửi feedback data:', feedbackData);
            const response = await feedbackService.createFeedback(feedbackData);
            console.log('Response từ API:', response);
            
            // Nếu không throw error, nghĩa là thành công
            toast.success('Tạo đánh giá thành công!');
            onSuccess?.(response.result);
        } catch (error) {
            console.error('Lỗi khi tạo feedback:', error);
            console.error('Error message:', error.message);
            toast.error(error.message || 'Không thể tạo đánh giá');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('feedback-form')}>
            <div className={cx('form-header')}>
                <h3>Đánh giá {targetUserName}</h3>
                <button className={cx('close-btn')} onClick={onCancel}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Rating Stars */}
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
                    <p className={cx('rating-text')}>
                        {rating} / 5 sao
                    </p>
                </div>

                {/* Comment */}
                <div className={cx('form-group')}>
                    <label htmlFor="comment">Bình luận (không bắt buộc)</label>
                    <textarea
                        id="comment"
                        className={cx('textarea')}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                        maxLength={500}
                        rows={4}
                    />
                    <p className={cx('char-count')}>
                        {comment.length}/500
                    </p>
                </div>

                {/* Image URL */}
                <div className={cx('form-group')}>
                    <label htmlFor="imageUrl">Link hình ảnh (không bắt buộc)</label>
                    <input
                        id="imageUrl"
                        type="url"
                        className={cx('input')}
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                    {imageUrl && (
                        <div className={cx('image-preview')}>
                            <img src={imageUrl} alt="Preview" onError={() => setImageUrl('')} />
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className={cx('form-actions')}>
                    <button
                        type="button"
                        className={cx('btn', 'btn-cancel')}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className={cx('btn', 'btn-submit')}
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
