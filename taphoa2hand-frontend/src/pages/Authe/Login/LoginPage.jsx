import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './LoginPage.module.scss';
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff
} from 'react-icons/fi';

import {
    login
} from '../../../services/authenticationService';

import {
    setToken
} from '../../../services/localstorageService';

import ReCAPTCHA from "react-google-recaptcha";

const cx = classNames.bind(styles);

function LoginPage() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] =
        useState(false);

    const [username, setUsername] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [errorMsg, setErrorMsg] =
        useState('');

    // captcha hiện hay không
    const [showCaptcha, setShowCaptcha] =
        useState(false);

    // token captcha
    const [captchaToken, setCaptchaToken] =
        useState("");

    // key để reset captcha
    const [captchaKey, setCaptchaKey] =
        useState(0);

    const togglePassword = () =>
        setShowPassword(!showPassword);

    const resetCaptcha = () => {

        setCaptchaToken("");

        // re-render captcha
        setCaptchaKey(prev => prev + 1);
    };

    const handleSubmit = async (e) => {

    e.preventDefault();

    setErrorMsg('');

    // đang yêu cầu captcha mà chưa tick
    if (showCaptcha && !captchaToken) {

        setErrorMsg(
            'Vui lòng xác minh captcha'
        );

        return;
    }

    try {

        const response = await login(
            username,
            password,
            captchaToken
        );

        const data =
            await response.json();

        // LOGIN SUCCESS
        if (
            response.ok &&
            data.code === 1000 &&
            data.result?.authenticated
        ) {

            setShowCaptcha(false);

            setCaptchaToken("");

            setToken(data.result.token);

            navigate('/');

            window.location.reload();

            return;
        }

        // BACKEND BẮT CAPTCHA
        if (
            data.code === 2004
            || data.code === 2005
        ) {

            setShowCaptcha(true);

            resetCaptcha();
        }

        // show lỗi backend
        setErrorMsg(
            data.message ||
            'Đăng nhập thất bại'
        );

    } catch (error) {

        console.error(error);

        if (showCaptcha) {
            resetCaptcha();
        }

        setErrorMsg(
            'Đã có lỗi xảy ra'
        );
    }
};

    return (

        <div className={cx('login-page')}>

            <div className={cx('login-container')}>

                <div className={cx('header')}>

                    <h1 className={cx('logo-text')}>
                        TapHoa
                        <span className={cx('highlight')}>
                            2Hand
                        </span>
                    </h1>

                    <p className={cx('subtitle')}>
                        Chào mừng bạn quay trở lại!
                    </p>

                </div>

                <form
                    className={cx('form')}
                    onSubmit={handleSubmit}
                >

                    {
                        errorMsg &&
                        <p className={cx('error-text')}>
                            {errorMsg}
                        </p>
                    }

                    <div className={cx('input-group')}>

                        <label>
                            Tên đăng nhập
                        </label>

                        <div className={cx('input-wrapper')}>

                            <FiMail className={cx('icon')} />

                            <input
                                type="text"
                                placeholder="Nhập username"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                required
                            />

                        </div>

                    </div>

                    <div className={cx('input-group')}>

                        <label>
                            Mật khẩu
                        </label>

                        <div className={cx('input-wrapper')}>

                            <FiLock className={cx('icon')} />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                            <button
                                type="button"
                                className={cx('eye-btn')}
                                onClick={togglePassword}
                            >

                                {
                                    showPassword
                                        ? <FiEye />
                                        : <FiEyeOff />
                                }

                            </button>

                        </div>

                    </div>

                    <div className={cx('form-actions')}>

                        <label className={cx('remember-me')}>
                            <input type="checkbox" />
                            <span>
                                Ghi nhớ tài khoản
                            </span>
                        </label>

                        <a
                            href="#"
                            className={cx('forgot-password')}
                        >
                            Quên mật khẩu?
                        </a>

                    </div>

                    {
                        showCaptcha && (

                            <div className={cx('captcha-wrapper')}>

                                <ReCAPTCHA
                                    key={captchaKey}
                                    sitekey="6Le_hu8sAAAAAJ7Yy3mPW8kCOnxfXRxQWmO34JVU"
                                    onChange={(token) =>
                                        setCaptchaToken(token)
                                    }
                                />

                            </div>
                        )
                    }

                    <button
                        type="submit"
                        className={cx('submit-btn')}
                    >
                        ĐĂNG NHẬP
                    </button>

                </form>

                <div className={cx('register-link')}>

                    <span>
                        Bạn chưa có tài khoản?
                    </span>

                    <a href="/register">
                        Đăng ký ngay
                    </a>

                </div>

            </div>

        </div>
    );
}

export default LoginPage;