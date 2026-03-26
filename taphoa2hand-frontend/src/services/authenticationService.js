// configurations/authService.js (hoặc file chứa hàm login của bạn)
import { API, CONFIG } from "../configurations/configuration";

export const login = async (username, password) => {
    // Phải cộng chuỗi API_GATEWAY + PATH
    const url = `${CONFIG.API_GATEWAY}${API.LOGIN}`; 
    
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
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
