import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

export const getAllCategories = async () => {
    try {
        const response = await httpClient.get(API.CATEGORY);
        return response.data; // Thường Spring trả về ApiResponse, lấy .data để lấy body
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};