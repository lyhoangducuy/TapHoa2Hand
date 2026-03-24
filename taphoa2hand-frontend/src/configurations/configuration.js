export const CONFIG = {
    // Vite sử dụng import.meta.env
    API_GATEWAY: import.meta.env.VITE_API_GATEWAY,
};

export const API = {
    LOGIN: "/auth/login",
    MY_INFO: "/users/myInfo",
    // Nếu bạn muốn lấy sẵn cái hàm update user hồi nãy:
    UPDATE_USER: (userId) => `/users/${userId}`,
};