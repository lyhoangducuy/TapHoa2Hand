import { API, CONFIG } from "../configurations/configuration";
import { getToken } from "./localStorageService";

// =========================================================
// SEARCH HISTORY (USER)
// =========================================================

export const getSearchHistory = async (userId) => {
    const token = getToken();

    const response = await fetch(
        `${CONFIG.API_GATEWAY}${API.GET_HISTORY_SEARCH(userId)}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }
    );

    return await response.json();
};