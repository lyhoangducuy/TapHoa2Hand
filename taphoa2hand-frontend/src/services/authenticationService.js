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
export const sendCode = async (email, code) => { // Thêm tham số code
    const url = `${CONFIG.API_GATEWAY}${API.CODE}`;
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }), // Truyền cả email và code xuống Backend
    });
};
export const reSendCode = async (email) => {
    const url = `${CONFIG.API_GATEWAY}${API.RECODE}`;
    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });
};
