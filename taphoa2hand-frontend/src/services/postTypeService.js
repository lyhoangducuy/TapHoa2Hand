import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

export const getAllPostsType = async () => {
    const token = localStorage.getItem('token');

    const res = await httpClient.get(API.GET_POST_TYPE, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    // 👇 QUAN TRỌNG: lấy đúng field result
    return res?.data?.result || [];
};