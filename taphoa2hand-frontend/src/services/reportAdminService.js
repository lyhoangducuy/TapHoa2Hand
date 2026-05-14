import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

// Get all reports for admin
export const getAllReports = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(API.ADMIN_GET_ALL_REPORTS, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data.result;
    } catch (error) {
        console.error("Error fetching all reports:", error);
        throw error;
    }
};

// Get report by ID
export const getReportById = async (reportId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(API.ADMIN_GET_REPORT_BY_ID(reportId), {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data.result;
    } catch (error) {
        console.error("Error fetching report:", error);
        throw error;
    }
};

// Get reports by status
export const getReportsByStatus = async (status) => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(API.ADMIN_GET_REPORTS_BY_STATUS(status), {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data.result;
    } catch (error) {
        console.error("Error fetching reports by status:", error);
        throw error;
    }
};

// Update report status
export const updateReportStatus = async (reportId, status) => {
    try {
        const token = localStorage.getItem('token');
        const response = await httpClient.put(API.ADMIN_UPDATE_REPORT_STATUS(reportId), 
            { status },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data.result;
    } catch (error) {
        console.error("Error updating report status:", error);
        throw error;
    }
};
