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