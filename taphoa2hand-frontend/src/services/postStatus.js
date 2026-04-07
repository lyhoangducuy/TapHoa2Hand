import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

export const getAllPostStatuses = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(API.GET_POST_STATUS, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; // Thường Spring trả về ApiResponse, lấy .data để lấy body
    } catch (error) {
        console.error("Error fetching post statuses:", error);
        throw error;
    }
};