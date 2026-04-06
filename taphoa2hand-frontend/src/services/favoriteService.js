import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";
const token = localStorage.getItem('token');
export const addPostToFavorites = async (postId) => {
    try {
        const response = await httpClient.post(API.ADD_FAVORITE(postId), {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error adding post to favorites with ID ${postId}:`, error);
        throw error;
    }
};
export const removePostFromFavorites = async (postId) => {
    try {
        const response = await httpClient.delete(API.REMOVE_FAVORITE(postId), {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error removing post from favorites with ID ${postId}:`, error);
        throw error;
    }
};
export const getMyFavoritePosts = async () => {
    try {
        const response = await httpClient.get(API.GET_MYFAVORITES, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching favorite posts:", error);
        throw error;
    }
};
export const isFavoritePost = async (postId) => {
    try {
        
        const response = await httpClient.get(API.CHECK_FAVORITE(postId), {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error checking if post with ID ${postId} is favorite:`, error);
        throw error;
    }
};
