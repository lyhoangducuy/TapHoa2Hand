import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

export const submitReportUser = async ({ reportedUserId, reason, files }) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Append các trường form trực tiếp
        formData.append('reportedUserId', reportedUserId);
        formData.append('reason', reason);

        // Append các ảnh minh chứng
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                formData.append('evidenceImages', file);
            });
        }

        const response = await httpClient.post(API.REPORT_SUBMIT_USER, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                // Ép Axios gửi dưới dạng Form Data
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error submitting user report:", error);
        throw error;
    }
};

export const submitReportPost = async ({ postId, reason, files }) => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error("No token found in localStorage");
            throw new Error("Authentication token not found");
        }
        
        const formData = new FormData();

        // Append các trường form trực tiếp
        formData.append('postId', postId);
        formData.append('reason', reason);

        // Append các ảnh minh chứng
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                formData.append('evidenceImages', file);
            });
        }

        // Debug: log FormData contents
        console.log("Submitting post report with:", {
            postId,
            reason,
            filesCount: files?.length || 0,
            tokenExists: !!token
        });

        const response = await httpClient.post(API.REPORT_SUBMIT_POST, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                // Ép Axios gửi dưới dạng Form Data
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error submitting post report:", error);
        console.error("Error response status:", error?.response?.status);
        console.error("Error response data:", error?.response?.data);
        console.error("Full error:", error);
        throw error;
    }
};

export const submitReportOrder = async ({ orderId, reason, files }) => {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Append các trường form trực tiếp
        formData.append('orderId', orderId);
        formData.append('reason', reason);

        // Append các ảnh minh chứng
        if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
                formData.append('evidenceImages', file);
            });
        }

        const response = await httpClient.post(API.REPORT_SUBMIT_ORDER, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                // Ép Axios gửi dưới dạng Form Data
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error submitting order report:", error);
        throw error;
    }
};
