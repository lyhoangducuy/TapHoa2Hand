import { API, CONFIG } from "../configurations/configuration";
const token = localStorage.getItem('token');
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