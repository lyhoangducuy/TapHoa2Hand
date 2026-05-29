import { API, CONFIG } from "../configurations/configuration";

const token = localStorage.getItem('token');

// API: Tạo cuộc hội thoại mới
export const createConversation = async (conversationData) => {
    const response = await fetch(CONFIG.API_GATEWAY + API.CREATE_CONVERSATION, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(conversationData),
    });
    return response.json();
};

// API: Lấy danh sách các cuộc hội thoại
export const getMyConversations = async () => {
    const response = await fetch(CONFIG.API_GATEWAY + API.GET_CONVERSATIONS, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
    });
    return response.json();
};

// API: Lấy danh sách tin nhắn của 1 cuộc hội thoại
export const getChatMessages = async (conversationId) => {
    // Dự phòng trường hợp API config của bạn không khớp
    const url = typeof API.GET_CHATMESSAGE === 'function' 
        ? API.GET_CHATMESSAGE(conversationId) 
        : `/chat-meassage?conversationId=${conversationId}`;

    const response = await fetch(CONFIG.API_GATEWAY + url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
    });
    return response.json();
};

// API: Gửi tin nhắn mới (text + media)
export const createChatMessage = async (formData) => {
    const url = API.CREATE_CHATMESSAGE || "/chat-message/create";
    
    const response = await fetch(CONFIG.API_GATEWAY + url, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`
            // Note: Không set Content-Type khi dùng FormData, browser sẽ tự set multipart/form-data với boundary
        },
        body: formData,
    });
    return response.json();
};