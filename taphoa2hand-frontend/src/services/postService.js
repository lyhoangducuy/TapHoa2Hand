import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

export const getAllPosts = async () => {
    try {
        const response = await httpClient.get(API.GET_POST);
        // Vì Backend trả về ApiResponse { code, message, result }
        // Chúng ta trả về response.data để lấy đúng object đó
        return response.data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};