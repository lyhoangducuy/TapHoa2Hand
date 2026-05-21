import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import styles from './FeedbackForm.module.scss';
import * as feedbackService from '../../services/feedbackService';

const cx = classNames.bind(styles);

const FeedbackForm = ({
    order,
    feedback,
    mode = 'create',
    onSuccess,
    onCancel,
}) => {
    const [rating, setRating] = useState(feedback?.rating || 5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(feedback?.comment || '');
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (feedback?.mediaList && feedback.mediaList.length > 0) {
            const urls = feedback.mediaList.map((m) => m.url);
            setPreviewUrls(urls);
        }
    }, [feedback]);

    const handleRemovePreview = (idx) => {
        setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
        setImages((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setPreviewUrls((prev) => [...prev, ...newPreviews]);
        setImages((prev) => [...prev, ...files]);
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating < 1 || rating > 5) {
            toast.error('Vui lòng chọn số sao hợp lệ (1-5)');
            return;
        }

        setLoading(true);

        try {
            const feedbackData = {
                orderId: order?.id || feedback?.orderId,
                rating,
                comment: comment.trim(),
            };

            let response;
            if (mode === 'edit') {
                response = await feedbackService.updateFeedback(feedback.id, feedbackData);
                toast.success('Cập nhật đánh giá thành công!');
            } else {
                response = await feedbackService.createFeedback(feedbackData, images);
                toast.success('Tạo đánh giá thành công!');
            }

            onSuccess?.(response.result);
        } catch (error) {
            console.error('Lỗi khi gửi feedback:', error);
            toast.error(error.message || 'Không thể gửi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const isEdit = mode === 'edit';
    const displayName = order?.sellerName
        || order?.sellerUsername
        || (feedback?.targetUserName)
        || 'Người bán';

    const orderLabel = order
        ? `#${String(order.id || '').substring(0, 8).toUpperCase()} — ${order.postTitle || ''}`
        : feedback?.orderId
        ? `#${String(feedback.orderId).substring(0, 8).toUpperCase()}`
        : '';

    return (
        <div className={cx('feedback-form')}>
            <div className={cx('form-header')}>
                <h3>{isEdit ? 'Chỉnh sửa đánh giá' : 'Đánh giá'} {displayName}</h3>
                <button className={cx('close-btn')} onClick={onCancel}>×</button>
            </div>

            {orderLabel && (
                <div className={cx('order-info')}>
                    <span>Đơn hàng: <strong>{orderLabel}</strong></span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* STAR */}
                <div className={cx('form-group')}>
                    <label>Số sao</label>
                    <div className={cx('rating-stars')}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={cx('star', { active: star <= (hoverRating || rating) })}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <div className={cx('rating-text')}>{rating}/5</div>
                </div>

                {/* COMMENT */}
                <div className={cx('form-group')}>
                    <label>Bình luận</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                    />
                    <div className={cx('char-count')}>{comment.length}/500</div>
                </div>

                {/* IMAGES */}
                <div className={cx('form-group')}>
                    <label>Hình ảnh {isEdit ? '(thêm mới)' : '(tùy chọn)'}</label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {previewUrls.length > 0 && (
                        <div className={cx('preview-grid')}>
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className={cx('preview-item')}>
                                    <img src={url} alt={`preview-${idx}`} />
                                    <button
                                        type="button"
                                        className={cx('remove-btn')}
                                        onClick={() => handleRemovePreview(idx)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className={cx('form-actions')}>
                    <button type="button" onClick={onCancel} disabled={loading}>
                        Hủy
                    </button>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang gửi...' : isEdit ? 'Lưu thay đổi' : 'Gửi đánh giá'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;
