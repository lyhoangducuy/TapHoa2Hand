import axiosClient from '../../../api/axiosClient';

export const postsApi = {
    getAllPosts: () => {
        // Gọi xuống endpoint GET /api/posts của backend
        const url = '/posts/getAll'; 
        return axiosClient.get(url);
    }
};