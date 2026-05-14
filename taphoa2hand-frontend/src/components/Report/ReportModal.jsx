import React, { useEffect, useId, useState } from 'react';
import classNames from 'classnames/bind';
import { FiImage, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import styles from './ReportModal.module.scss';
import * as reportService from '../../services/reportService';

const cx = classNames.bind(styles);

const MIN_LEN = 10;
const MAX_LEN = 1000;
const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024;

const TITLES = {
    user: 'Báo cáo người dùng',
    post: 'Báo cáo tin đăng',
    order: 'Báo cáo đơn hàng',
};

function makeAttachmentKey(file) {
    return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @param {'user'|'post'|'order'} variant
 * @param {string} targetId — reportedUserId | postId | orderId
 */
const ReportModal = ({ open, onClose, variant, targetId, subtitle }) => {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');
    /** @type {{ key: string, file: File, url: string }[]} */
    const [attachments, setAttachments] = useState([]);
    const fileInputId = useId();

    const revokeAll = (list) => {
        list.forEach((a) => URL.revokeObjectURL(a.url));
    };

    useEffect(() => {
        if (!open) {
            setAttachments((prev) => {
                revokeAll(prev);
                return [];
            });
            setReason('');
            setLocalError('');
            return;
        }
        setReason('');
        setLocalError('');
        setAttachments((prev) => {
            revokeAll(prev);
            return [];
        });
    }, [open, targetId, variant]);

    if (!open) return null;

    const trimmed = reason.trim();
    const lenOk = trimmed.length >= MIN_LEN && trimmed.length <= MAX_LEN;

    const addFiles = (fileList) => {
        const incoming = Array.from(fileList || []);
        if (!incoming.length) return;

        setAttachments((prev) => {
            const next = [...prev];
            let skipped = 0;
            for (const file of incoming) {
                if (next.length >= MAX_FILES) {
                    skipped += 1;
                    continue;
                }
                if (!file.type.startsWith('image/')) {
                    skipped += 1;
                    continue;
                }
                if (file.size > MAX_BYTES) {
                    toast.warning(`Bỏ qua ảnh quá 10MB: ${file.name}`);
                    skipped += 1;
                    continue;
                }
                next.push({
                    key: makeAttachmentKey(file),
                    file,
                    url: URL.createObjectURL(file),
                });
            }
            if (next.length >= MAX_FILES && incoming.length) {
                toast.info(`Tối đa ${MAX_FILES} ảnh minh chứng.`);
            } else if (skipped > 0) {
                toast.info('Chỉ chấp nhận file ảnh (JPEG, PNG, …).');
            }
            return next;
        });
    };

    const removeAttachment = (key) => {
        setAttachments((prev) => {
            const found = prev.find((a) => a.key === key);
            if (found) URL.revokeObjectURL(found.url);
            return prev.filter((a) => a.key !== key);
        });
    };

    const handleSubmit = async () => {
        setLocalError('');
        if (!lenOk) {
            setLocalError(`Nội dung cần từ ${MIN_LEN} đến ${MAX_LEN} ký tự.`);
            return;
        }
        if (!targetId) {
            toast.error('Thiếu thông tin đối tượng báo cáo.');
            return;
        }
        const files = attachments.map((a) => a.file);
        try {
            setSubmitting(true);
            let res;
            if (variant === 'user') {
                res = await reportService.submitReportUser({
                    reportedUserId: targetId,
                    reason: trimmed,
                    files,
                });
            } else if (variant === 'post') {
                res = await reportService.submitReportPost({
                    postId: targetId,
                    reason: trimmed,
                    files,
                });
            } else {
                res = await reportService.submitReportOrder({
                    orderId: targetId,
                    reason: trimmed,
                    files,
                });
            }
            const data = res?.data;
            if (data?.code === 1000) {
                toast.success(data?.message || 'Đã gửi báo cáo. Ban quản trị sẽ xem xét.');
                onClose?.();
            } else {
                toast.error(data?.message || 'Không gửi được báo cáo.');
            }
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || 'Có lỗi khi gửi báo cáo.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const variantClass =
        variant === 'user' ? 'variantUser' : variant === 'post' ? 'variantPost' : 'variantOrder';

    return (
        <div className={cx('overlay')} role="presentation" onClick={onClose}>
            <div
                className={cx('modal', variantClass)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={cx('header')}>
                    <div className={cx('titleBlock')}>
                        <h2 id="report-modal-title" className={cx('title')}>
                            {TITLES[variant] || 'Báo cáo'}
                        </h2>
                        {subtitle ? <p className={cx('subtitle')}>{subtitle}</p> : null}
                    </div>
                    <button type="button" className={cx('closeBtn')} onClick={onClose} aria-label="Đóng">
                        <FiX size={22} />
                    </button>
                </div>
                <div className={cx('body')}>
                    <p className={cx('hint')}>
                        Mô tả ngắn gọn lý do (spam, lừa đảo, ngôn từ xấu, v.v.). Tối thiểu {MIN_LEN} ký tự.
                    </p>
                    <textarea
                        className={cx('textarea')}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        maxLength={MAX_LEN}
                        placeholder="Nhập nội dung báo cáo..."
                    />
                    <div className={cx('counter')}>
                        {reason.trim().length} / {MAX_LEN}
                    </div>

                    <div className={cx('evidenceBlock')}>
                        <p className={cx('evidenceTitle')}>Ảnh minh chứng (không bắt buộc)</p>
                        <p className={cx('fileHint')}>
                            Tối đa {MAX_FILES} ảnh, mỗi ảnh tối đa 10MB. Có thể chọn nhiều file cùng lúc.
                        </p>
                        <div className={cx('filePickRow')}>
                            <input
                                id={fileInputId}
                                type="file"
                                className={cx('fileInput')}
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    addFiles(e.target.files);
                                    e.target.value = '';
                                }}
                            />
                            <label htmlFor={fileInputId} className={cx('filePickLabel')}>
                                <FiImage size={18} />
                                Chọn ảnh
                            </label>
                            <span className={cx('fileCount')}>
                                {attachments.length}/{MAX_FILES}
                            </span>
                        </div>
                        {attachments.length > 0 ? (
                            <div className={cx('previewGrid')}>
                                {attachments.map((a) => (
                                    <div key={a.key} className={cx('previewItem')}>
                                        <img className={cx('previewImg')} src={a.url} alt="" />
                                        <button
                                            type="button"
                                            className={cx('removeThumb')}
                                            onClick={() => removeAttachment(a.key)}
                                            aria-label="Xóa ảnh"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {localError ? <p className={cx('error')}>{localError}</p> : null}
                    <div className={cx('footer')}>
                        <button type="button" className={cx('btnGhost')} onClick={onClose} disabled={submitting}>
                            Hủy
                        </button>
                        <button type="button" className={cx('btnPrimary')} onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
