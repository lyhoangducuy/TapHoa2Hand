// configurations/authService.js (hoặc file chứa hàm login của bạn)
import { API, CONFIG } from "../configurations/configuration";

export const login = async (
    username,
    password,
    captchaToken
) => {

    const url =
        `${CONFIG.API_GATEWAY}${API.LOGIN}`;

    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
            captchaToken
        }),
    });
};
export const checkCaptchaRequired = async (username) => {

    const url =
        `${CONFIG.API_GATEWAY}/auth/captcha-required?username=${username}`;

    return await fetch(url, {
        method: "POST",
    });
};
export const register = async (userData) => {
    const url = `${CONFIG.API_GATEWAY}${API.REGISTER_USER}`;

    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });
};
export const sendCode = async (email, code) => {
    const url = `${CONFIG.API_GATEWAY}/auth/send-code`; // CHÚ Ý: Chỗ này thường là một URL khác, ví dụ /verify-code chứ không phải /send-code
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // Lúc này mới cần gửi cả 2 lên để Backend so sánh với Redis
        body: JSON.stringify({ email: email, code: code }),
    });
};
export const reSendCode = async (email) => {
    const url = `${CONFIG.API_GATEWAY}${API.RECODE}`;
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email}), // Truyền cả email và code xuống Backend
    });
};

// ============== FORGOT PASSWORD APIs ==============

export const forgotPassword = async (email) => {
    const url = `${CONFIG.API_GATEWAY}/auth/forgot-password`;
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });
};

export const verifyForgotPasswordOtp = async (email, otp) => {
    const url = `${CONFIG.API_GATEWAY}/auth/verify-forgot-password-otp`;
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
    });
};

export const resetPassword = async (email, resetToken, newPassword, confirmPassword) => {
    const url = `${CONFIG.API_GATEWAY}/auth/reset-password`;
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            resetToken,
            newPassword,
            confirmPassword
        }),
    });
};

export const resendForgotPasswordOtp = async (email) => {
    const url = `${CONFIG.API_GATEWAY}/auth/resend-forgot-password-otp`;
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });
};
