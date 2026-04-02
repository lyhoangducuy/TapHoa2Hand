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