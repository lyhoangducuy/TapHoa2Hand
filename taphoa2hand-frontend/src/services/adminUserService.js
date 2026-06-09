import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

/**
 * Block a user account
 * @param {string} userId - The user ID to block
 * @param {string} reason - Reason for blocking
 * @param {number|null} durationHours - Duration in hours. null = permanent, 24 = 24h, etc.
 * @returns {Promise<string>} Success message from backend
 */
export const blockUser = async (userId, reason = null, durationHours = null) => {
    const body = {};
    if (reason) body.reason = reason;
    if (durationHours !== null && durationHours !== undefined) {
        body.durationHours = durationHours;
    }
    const response = await httpClient.post(
        API.ADMIN_BLOCK_USER(userId),
        body,
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
