import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

/**
 * Block a user account
 * @param {string} userId - The user ID to block
 * @param {string} reason - Optional reason for blocking
 * @returns {Promise<string>} Success message from backend
 */
export const blockUser = async (userId, reason = null) => {
    const response = await httpClient.post(
        API.ADMIN_BLOCK_USER(userId),
        reason ? { reason } : {},
        { headers: { ...headers(), 'Content-Type': 'application/json' } }
    );
    return response.data.message;
};

/**
 * Unblock a user account
 * @param {string} userId - The user ID to unblock
 * @returns {Promise<string>} Success message from backend
 */
export const unblockUser = async (userId) => {
    const response = await httpClient.post(
        API.ADMIN_UNBLOCK_USER(userId),
        {},
        { headers: { ...headers(), 'Content-Type': 'application/json' } }
    );
    return response.data.message;
};
