import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

export const chatWithAI = async (message, file) => {
    try {
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("message", message);

        if (file) {
            formData.append("file", file);
        }

        const response = await httpClient.post(API.POST_CHAT_AI, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    } catch (error) {
        console.error("Chat AI error:", error);
        throw error;
    }
};