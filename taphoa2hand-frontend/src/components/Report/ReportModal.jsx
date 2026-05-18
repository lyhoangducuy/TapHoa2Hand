import React, { useEffect, useId, useState } from 'react';
import classNames from 'classnames/bind';
import { FiImage, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReCAPTCHA from "react-google-recaptcha";

import styles from './ReportModal.module.scss';
import * as reportService from '../../services/reportService';

const cx = classNames.bind(styles);

const MIN_DETAIL_LEN = 20;
const MAX_DETAIL_LEN = 2000;
const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024;

const TITLES = {
    user: 'Báo cáo người dùng',
    post: 'Báo cáo tin đăng',
    order: 'Báo cáo đơn hàng',
};

function makeAttachmentKey(file) {
    return `${file.name}-${file.size}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
}

const ReportModal = ({
    open,
    onClose,
    onSuccess,
    variant,
    targetId,
    subtitle,
}) => {

    const [reasons, setReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState('');
    const [detail, setDetail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const [attachments, setAttachments] = useState([]);

    // CAPTCHA
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaKey, setCaptchaKey] = useState(0);

    const fileInputId = useId();

    useEffect(() => {

        if (!open) return;

        fetchReasons();

    }, [open]);

    const fetchReasons = async () => {

        try {

            const res =
                await reportService.getReportReasons();

            if (res?.result) {
                setReasons(res.result);
            }

        } catch (error) {

            console.error(error);

            toast.error(
                'Không tải được danh sách lý do báo cáo'
            );
        }
    };

    const revokeAll = (list) => {

        list.forEach((a) =>
            URL.revokeObjectURL(a.url)
        );
    };

    useEffect(() => {

        if (!open) return;

        setSelectedReason('');
        setDetail('');
        setLocalError('');
        setCaptchaToken('');
        setCaptchaKey(0);

        setAttachments((prev) => {

            revokeAll(prev);

            return [];
        });

    }, [open, targetId, variant]);

    if (!open) return null;

    const trimmedDetail = detail.trim();

    const resetCaptcha = () => {

        setCaptchaToken('');

        setCaptchaKey(prev => prev + 1);
    };

    const addFiles = (fileList) => {

        const incoming =
            Array.from(fileList || []);

        if (!incoming.length) return;

        setAttachments((prev) => {

            const next = [...prev];

            for (const file of incoming) {

                if (next.length >= MAX_FILES) {

                    toast.warning(
                        `Tối đa ${MAX_FILES} ảnh`
                    );

                    break;
                }

                if (
                    !file.type.startsWith('image/')
                ) {

                    toast.warning(
                        `${file.name} không phải file ảnh`
                    );

                    continue;
                }

                if (file.size > MAX_BYTES) {

                    toast.warning(
                        `${file.name} vượt quá 10MB`
                    );

                    continue;
                }

                next.push({
                    key: makeAttachmentKey(file),
                    file,
                    url: URL.createObjectURL(file),
                });
            }

            return next;
        });
    };

    const removeAttachment = (key) => {

        setAttachments((prev) => {

            const found =
                prev.find((a) => a.key === key);

            if (found) {
                URL.revokeObjectURL(found.url);
            }

            return prev.filter(
                (a) => a.key !== key
            );
        });
    };

    const handleSubmit = async () => {

        setLocalError('');

        if (!selectedReason) {

            setLocalError(
                'Vui lòng chọn lý do báo cáo'
            );

            return;
        }

        if (
            trimmedDetail.length < MIN_DETAIL_LEN ||
            trimmedDetail.length > MAX_DETAIL_LEN
        ) {

            setLocalError(
                `Mô tả phải từ ${MIN_DETAIL_LEN} - ${MAX_DETAIL_LEN} ký tự`
            );

            return;
        }

        if (!targetId) {

            toast.error(
                'Thiếu đối tượng báo cáo'
            );

            return;
        }

        // CAPTCHA REQUIRED
        if (!captchaToken) {

            setLocalError(
                'Vui lòng xác minh captcha'
            );

            return;
        }

        const files =
            attachments.map((a) => a.file);

        try {

            setSubmitting(true);

            let res;

            if (variant === 'user') {

                res =
                    await reportService.submitReportUser({
                        reportedUserId: targetId,
                        reason: selectedReason,
                        detail: trimmedDetail,
                        files,
                        captchaToken,
                    });

            } else if (variant === 'post') {

                res =
                    await reportService.submitReportPost({
                        postId: targetId,
                        reason: selectedReason,
                        detail: trimmedDetail,
                        files,
                        captchaToken,
                    });

            } else {

                res =
                    await reportService.submitReportOrder({
                        orderId: targetId,
                        reason: selectedReason,
                        detail: trimmedDetail,
                        files,
                        captchaToken,
                    });
            }

            toast.success(
                res?.message ||
                'Đã gửi báo cáo thành công'
            );

            onClose?.();

            onSuccess?.();

        } catch (e) {

            console.error(e);

            const message =
                e?.response?.data?.message ||
                e?.message ||
                'Gửi báo cáo thất bại';

            if (
                message
                    ?.toLowerCase()
                    .includes('captcha')
            ) {

                resetCaptcha();
            }

            toast.error(message);

        } finally {

            setSubmitting(false);
        }
    };

    const variantClass =
        variant === 'user'
            ? 'variantUser'
            : variant === 'post'
            ? 'variantPost'
            : 'variantOrder';

    return (

        <div
            className={cx('overlay')}
            onClick={onClose}
        >

            <div
                className={cx('modal', variantClass)}
                onClick={(e) => e.stopPropagation()}
            >

                <div className={cx('header')}>

                    <div className={cx('titleBlock')}>

                        <h2 className={cx('title')}>
                            {TITLES[variant]}
                        </h2>

                        {
                            subtitle && (

                                <p className={cx('subtitle')}>
                                    {subtitle}
                                </p>
                            )
                        }

                    </div>

                    <button
                        className={cx('closeBtn')}
                        onClick={onClose}
                    >
                        <FiX size={20} />
                    </button>

                </div>

                <div className={cx('body')}>

                    {/* Reason */}
                    <div className={cx('field')}>

                        <label className={cx('label')}>
                            Lý do báo cáo
                        </label>

                        <select
                            className={cx('select')}
                            value={selectedReason}
                            onChange={(e) =>
                                setSelectedReason(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                -- Chọn lý do --
                            </option>

                            {
                                reasons.map((item) => (

                                    <option
                                        key={item.name}
                                        value={item.name}
                                    >
                                        {item.displayName}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* Detail */}
                    <div className={cx('field')}>

                        <label className={cx('label')}>
                            Mô tả chi tiết
                        </label>

                        <textarea
                            className={cx('textarea')}
                            value={detail}
                            onChange={(e) =>
                                setDetail(e.target.value)
                            }
                            maxLength={MAX_DETAIL_LEN}
                            placeholder="Mô tả chi tiết nội dung báo cáo..."
                        />

                        <div className={cx('counter')}>
                            {trimmedDetail.length}
                            /
                            {MAX_DETAIL_LEN}
                        </div>

                    </div>

                    {/* Upload */}
                    <div className={cx('evidenceBlock')}>

                        <p className={cx('evidenceTitle')}>
                            Ảnh minh chứng
                        </p>

                        <div className={cx('filePickRow')}>

                            <input
                                id={fileInputId}
                                type="file"
                                multiple
                                accept="image/*"
                                className={cx('fileInput')}
                                onChange={(e) => {

                                    addFiles(e.target.files);

                                    e.target.value = '';
                                }}
                            />

                            <label
                                htmlFor={fileInputId}
                                className={cx('filePickLabel')}
                            >
                                <FiImage size={18} />
                                Chọn ảnh
                            </label>

                            <span className={cx('fileCount')}>
                                {attachments.length}
                                /
                                {MAX_FILES}
                            </span>

                        </div>

                        {
                            attachments.length > 0 && (

                                <div className={cx('previewGrid')}>

                                    {
                                        attachments.map((a) => (

                                            <div
                                                key={a.key}
                                                className={cx('previewItem')}
                                            >

                                                <img
                                                    src={a.url}
                                                    alt=""
                                                    className={cx('previewImg')}
                                                />

                                                <button
                                                    type="button"
                                                    className={cx('removeThumb')}
                                                    onClick={() =>
                                                        removeAttachment(a.key)
                                                    }
                                                >
                                                    <FiX size={15} />
                                                </button>

                                            </div>
                                        ))
                                    }

                                </div>
                            )
                        }

                    </div>

                    {/* CAPTCHA */}
                    <div className={cx('captchaWrapper')}>

                        <ReCAPTCHA
                            key={captchaKey}
                            sitekey="6Le_hu8sAAAAAJ7Yy3mPW8kCOnxfXRxQWmO34JVU"
                            onChange={(token) =>
                                setCaptchaToken(token)
                            }
                        />

                    </div>

                    {
                        localError && (

                            <p className={cx('error')}>
                                {localError}
                            </p>
                        )
                    }

                    <div className={cx('footer')}>

                        <button
                            className={cx('btnGhost')}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Hủy
                        </button>

                        <button
                            className={cx('btnPrimary')}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {
                                submitting
                                    ? 'Đang gửi...'
                                    : 'Gửi báo cáo'
                            }
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ReportModal;