import { API, CONFIG } from "../configurations/configuration"
import httpClient from "../configurations/httpClient"
import { getToken } from "./localstorageService"
export const getMyInfo=async()=>{
    return await httpClient.get(API.MY_INFO,{
        headers:{
            Authorization: `Bearer ${getToken()}`
        }
    })
}
export const updateAvatar = async (file) => {
    // 1. Đóng gói file vào FormData
    const formData = new FormData();
    formData.append('file', file);

    // 2. Lấy token từ service có sẵn
    const token = getToken(); // Hoặc localStorage.getItem('token') tùy cách ông viết trong service

    // 3. Gọi API (Sửa lại URL bằng biến môi trường của ông)
    const url = `${CONFIG.API_GATEWAY}${API.UPDATE_AVATAR()}`; // Nếu API.UPDATE_AVATAR là một hàm, nhớ gọi nó với userId nếu cần
    
    return await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
            // TUYỆT ĐỐI KHÔNG set Content-Type ở đây để trình duyệt tự lo boundary cho file
        },
        body: formData,
    }).then(res => res.json()); // Trả về dạng JSON luôn cho UI dễ dùng
};
// Thêm hàm này vào userService.js của ông
export const updateUserInfo = async (userId, data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${CONFIG.API_GATEWAY}${API.UPDATE_USER(userId)}`, { // Sửa lại /users hay /user cho đúng với Backend của ông
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
};
export const getUserAdmin = async (page = 0, size = 10) => {
    try {
        // 1. Lấy token từ LocalStorage (hoặc Cookie, tùy cách bạn lưu khi Login)
        const token = localStorage.getItem('token'); 
        
        // Cấu hình URL gọi tới Backend
        const url = `${CONFIG.API_GATEWAY}${API.ADMIN_GETUSER}?page=${page}&size=${size}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // 2. Gắn Token vào đây để Backend biết mình là Admin hợp lệ
                "Authorization": `Bearer ${token}` 
            }
        });

        // 3. Xử lý dữ liệu trả về
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Lỗi gọi API getUserAdmin:", error);
        throw error;
    }
};