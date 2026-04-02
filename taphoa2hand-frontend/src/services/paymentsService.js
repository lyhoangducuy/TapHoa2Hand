import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

export const getAllPayments = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(API.PAYMENT, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data; // Thường Spring trả về ApiResponse, lấy .data để lấy body
    } catch (error) {
        console.error("Error fetching payments:", error);
        throw error;
    }
};