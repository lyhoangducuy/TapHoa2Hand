import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ForgotPasswordPage.module.scss';
import {
    FiMail,
    FiLock,
    FiKey,
    FiEye,
    FiEyeOff,
    FiArrowLeft,
    FiCheck,
    FiAlertCircle
} from 'react-icons/fi';

import {
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    resendForgotPasswordOtp
} from '../../../services/authenticationService';

const cx = classNames.bind(styles);

function ForgotPasswordPage() {
    const navigate = useNavigate();

    // Step: 1 = email, 2 = otp, 3 = new password
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Step 1: Send email to get OTP
    const handleSendEmail = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!email) {
            setErrorMsg('Vui lòng nhập email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg('Email không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const response = await forgotPassword(email);
            const data = await response.json();

            if (response.ok && data.code === 1000) {
                setSuccessMsg('Mã OTP đã được gửi đến email của bạn');
                setStep(2);
                setCountdown(60); // Start 60s countdown
            } else {
                setErrorMsg(data.message || 'Gửi yêu cầu thất bại');
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!otp || otp.length !== 6) {
            setErrorMsg('Vui lòng nhập mã OTP 6 số');
            return;
        }

        setLoading(true);
        try {
            const response = await verifyForgotPasswordOtp(email, otp);
            const data = await response.json();

            if (response.ok && data.code === 1000 && data.result?.success) {
                setResetToken(data.result.resetToken);
                setStep(3);
                setSuccessMsg('');
            } else {
                setErrorMsg(data.message || 'Mã OTP không hợp lệ');
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return;

        setErrorMsg('');
        setLoading(true);
        try {
            const response = await resendForgotPasswordOtp(email);
            const data = await response.json();

            if (response.ok && data.code === 1000) {
                setSuccessMsg('Mã OTP mới đã được gửi');
                setOtp('');
                setCountdown(60);
            } else {
                setErrorMsg(data.message || 'Gửi lại OTP thất bại');
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!newPassword || newPassword.length < 6) {
            setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            const response = await resetPassword(email, resetToken, newPassword, confirmPassword);
            const data = await response.json();

            if (response.ok && data.code === 1000 && data.result?.success) {
                setSuccessMsg('Đặt lại mật khẩu thành công!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setErrorMsg(data.message || 'Đặt lại mật khẩu thất bại');
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Go back to previous step
    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setOtp('');
            setErrorMsg('');
            setSuccessMsg('');
        } else if (step === 3) {
            setStep(2);
            setNewPassword('');
            setConfirmPassword('');
            setErrorMsg('');
        }
    };

    return (
        <div className={cx('forgot-page')}>
            <div className={cx('forgot-container')}>
                {/* Header */}
                <div className={cx('header')}>
                    {step > 1 && (
                        <button className={cx('back-btn')} onClick={handleBack}>
                            <FiArrowLeft />
                        </button>
                    )}
                    <h1 className={cx('logo-text')}>
                        TapHoa
                        <span className={cx('highlight')}>2Hand</span>
                    </h1>
                </div>

                <p className={cx('subtitle')}>
                    {step === 1 && 'Khôi phục mật khẩu'}
                    {step === 2 && 'Nhập mã xác thực'}
                    {step === 3 && 'Đặt mật khẩu mới'}
                </p>

                {/* Step indicators */}
                <div className={cx('step-indicator')}>
                    <div className={cx('step', { active: step >= 1, completed: step > 1 })}>
                        <span className={cx('step-num')}>1</span>
                        <span className={cx('step-label')}>Email</span>
                    </div>
                    <div className={cx('step-line', { active: step >= 2 })} />
                    <div className={cx('step', { active: step >= 2, completed: step > 2 })}>
                        <span className={cx('step-num')}>2</span>
                        <span className={cx('step-label')}>Xác thực</span>
                    </div>
                    <div className={cx('step-line', { active: step >= 3 })} />
                    <div className={cx('step', { active: step >= 3 })}>
                        <span className={cx('step-num')}>3</span>
                        <span className={cx('step-label')}>Mật khẩu</span>
                    </div>
                </div>

                {/* Error/Success messages */}
                {errorMsg && (
                    <div className={cx('error-text')}>
                        <FiAlertCircle /> {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className={cx('success-text')}>
                        <FiCheck /> {successMsg}
                    </div>
                )}

                {/* Step 1: Email Form */}
                {step === 1 && (
                    <form className={cx('form')} onSubmit={handleSendEmail}>
                        <div className={cx('input-group')}>
                            <label>Email</label>
                            <div className={cx('input-wrapper')}>
                                <FiMail className={cx('icon')} />
                                <input
                                    type="email"
                                    placeholder="Nhập email đã đăng ký"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className={cx('submit-btn')} disabled={loading}>
                            {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Form */}
                {step === 2 && (
                    <form className={cx('form')} onSubmit={handleVerifyOtp}>
                        <p className={cx('otp-hint')}>
                            Mã xác thực đã được gửi đến<br />
                            <strong>{email}</strong>
                        </p>

                        <div className={cx('input-group')}>
                            <label>Mã OTP</label>
                            <div className={cx('input-wrapper')}>
                                <FiKey className={cx('icon')} />
                                <input
                                    type="text"
                                    placeholder="Nhập 6 số OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className={cx('submit-btn')} disabled={loading}>
                            {loading ? 'Đang xác thực...' : 'Xác thực'}
                        </button>

                        <div className={cx('resend-section')}>
                            {countdown > 0 ? (
                                <span className={cx('countdown')}>
                                    Gửi lại sau {countdown}s
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className={cx('resend-btn')}
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                >
                                    Gửi lại mã OTP
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {/* Step 3: New Password Form */}
                {step === 3 && (
                    <form className={cx('form')} onSubmit={handleResetPassword}>
                        <p className={cx('success-hint')}>
                            <FiCheck /> Xác thực thành công! Vui lòng nhập mật khẩu mới.
                        </p>

                        <div className={cx('input-group')}>
                            <label>Mật khẩu mới</label>
                            <div className={cx('input-wrapper')}>
                                <FiLock className={cx('icon')} />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className={cx('eye-btn')}
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className={cx('input-group')}>
                            <label>Xác nhận mật khẩu</label>
                            <div className={cx('input-wrapper')}>
                                <FiLock className={cx('icon')} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className={cx('eye-btn')}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={cx('submit-btn')} disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>
                )}

                {/* Back to login */}
                <div className={cx('back-login')}>
                    <span>Bạn đã nhớ ra mật khẩu? </span>
                    <a href="/login">Đăng nhập ngay</a>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
