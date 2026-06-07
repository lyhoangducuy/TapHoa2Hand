import axios from '../configurations/httpClient';
import { CONFIG } from '../configurations/configuration';
import { getToken } from './localStorageService';

const BASE_URL = `${CONFIG.API_GATEWAY}/api/admin/statistics`;

const createAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============== DASHBOARD OVERVIEW ==============

export const getDashboardOverview = async () => {
    const response = await axios.get(`${BASE_URL}/overview`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== SUMMARY ==============

export const getSummary = async (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await axios.get(`${BASE_URL}/summary?${params.toString()}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== REVENUE CHART ==============

export const getRevenueChart = async (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await axios.get(`${BASE_URL}/revenue-chart?${params.toString()}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

export const getRevenueByMonth = async (year = new Date().getFullYear()) => {
    const response = await axios.get(`${BASE_URL}/revenue-by-month?year=${year}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== ORDER STATUS DISTRIBUTION ==============

export const getOrderStatusDistribution = async () => {
    const response = await axios.get(`${BASE_URL}/order-status-distribution`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== POSTS BY CATEGORY ==============

export const getPostsByCategory = async () => {
    const response = await axios.get(`${BASE_URL}/posts-by-category`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== REPORT REASONS ==============

export const getReportReasonsDistribution = async () => {
    const response = await axios.get(`${BASE_URL}/report-reasons`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== TOP SELLERS ==============

export const getTopSellers = async (limit = 5) => {
    const response = await axios.get(`${BASE_URL}/top-sellers?limit=${limit}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== TOP REPORTED USERS ==============

export const getTopReportedUsers = async (limit = 5) => {
    const response = await axios.get(`${BASE_URL}/top-reported-users?limit=${limit}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== RATING DISTRIBUTION ==============

export const getRatingDistribution = async () => {
    const response = await axios.get(`${BASE_URL}/rating-distribution`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== AI ASSESSMENT DISTRIBUTION ==============

export const getAiAssessmentDistribution = async () => {
    const response = await axios.get(`${BASE_URL}/ai-assessment-distribution`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== RECENT ACTIVITIES ==============

export const getRecentActivities = async (limit = 10) => {
    const response = await axios.get(`${BASE_URL}/recent-activities?limit=${limit}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== ORDERS (Paginated) ==============

export const getOrdersStatistics = async (fromDate, toDate, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('page', page);
    params.append('size', size);

    const response = await axios.get(`${BASE_URL}/orders?${params.toString()}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== USERS (Paginated) ==============

export const getUsersStatistics = async (fromDate, toDate, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('page', page);
    params.append('size', size);

    const response = await axios.get(`${BASE_URL}/users?${params.toString()}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== REPORTS (Paginated) ==============

export const getReportsStatistics = async (fromDate, toDate, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('page', page);
    params.append('size', size);

    const response = await axios.get(`${BASE_URL}/reports?${params.toString()}`, {
        headers: createAuthHeader()
    });
    return response.data;
};

// ============== EXPORT EXCEL ==============

const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const exportOrdersExcel = async (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await axios.get(`${BASE_URL}/export/orders?${params.toString()}`, {
        headers: {
            ...createAuthHeader(),
            'Content-Type': 'application/json'
        },
        responseType: 'blob'
    });

    const filename = `orders-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadFile(new Blob([response.data]), filename);
};

export const exportUsersExcel = async (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await axios.get(`${BASE_URL}/export/users?${params.toString()}`, {
        headers: {
            ...createAuthHeader(),
            'Content-Type': 'application/json'
        },
        responseType: 'blob'
    });

    const filename = `users-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadFile(new Blob([response.data]), filename);
};

export const exportReportsExcel = async (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await axios.get(`${BASE_URL}/export/reports?${params.toString()}`, {
        headers: {
            ...createAuthHeader(),
            'Content-Type': 'application/json'
        },
        responseType: 'blob'
    });

    const filename = `reports-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadFile(new Blob([response.data]), filename);
};

export const exportRevenueExcel = async (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await axios.get(`${BASE_URL}/export/revenue?${params.toString()}`, {
        headers: {
            ...createAuthHeader(),
            'Content-Type': 'application/json'
        },
        responseType: 'blob'
    });

    const filename = `revenue-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadFile(new Blob([response.data]), filename);
};
