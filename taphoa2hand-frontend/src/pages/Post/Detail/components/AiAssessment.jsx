import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from '../PostDetailPage.module.scss';
import { FiCpu, FiAlertTriangle, FiThumbsUp } from 'react-icons/fi';
import { getCheckAI } from '../../../../services/postService';

const cx = classNames.bind(styles);

const AiAssessment = ({ postId }) => {
    const [aiResult, setAiResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
    const fetchAiData = async () => {
        const token = localStorage.getItem('token');
        
        // Nếu không có token thì bỏ qua, không gọi API nữa
        if (!token) {
            setLoading(false);
            setError(true);
            return;
        }

        if (!postId) return;
        
        try {
            const res = await getCheckAI(postId);
            if (res && res.code === 1000 && res.result) {
                setAiResult(res.result);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error("Lỗi khi gọi AI phân tích:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    fetchAiData();
}, [postId]);

    // Trạng thái đang tải
    if (loading) {
        return (
            <div className={cx('ai-card', 'loading')}>
                <FiCpu className={cx('spin-icon')} /> AI đang phân tích độ chính xác của tin đăng...
            </div>
        );
    }
    
    // Nếu có lỗi hoặc không có dữ liệu thì ẩn luôn khối này
    if (error || !aiResult) return null; 

    // Bóc tách chính xác các trường từ JSON
    const { isMatching, estimatedWearLevel, reason, recommendation } = aiResult;

    return (
        <div className={cx('ai-card', { 'is-matching': isMatching, 'not-matching': !isMatching })}>
            <div className={cx('ai-header')}>
                <FiCpu className={cx('ai-icon')} />
                <h3>Đánh giá từ AI TapHoa2Hand</h3>
                <span className={cx('badge', isMatching ? 'success' : 'warning')}>
                    {isMatching ? <><FiThumbsUp/> Khớp mô tả</> : <><FiAlertTriangle/> Có điểm bất thường</>}
                </span>
            </div>
            
            <div className={cx('ai-body')}>
                <div className={cx('ai-row')}>
                    <strong>Mức độ hao mòn dự kiến:</strong> 
                    <span className={cx('highlight')}>{estimatedWearLevel || 'Chưa đánh giá được'}</span>
                </div>
                <div className={cx('ai-row')}>
                    <strong>Lý do AI kết luận:</strong> 
                    <p className={cx('ai-text')}>{reason || 'Không có thông tin lý do.'}</p>
                </div>
                <div className={cx('ai-row')}>
                    <strong>Lời khuyên cho bạn:</strong> 
                    <p className={cx('ai-text')}>{recommendation || 'Không có lời khuyên.'}</p>
                </div>
            </div>
        </div>
    );
};

export default AiAssessment;