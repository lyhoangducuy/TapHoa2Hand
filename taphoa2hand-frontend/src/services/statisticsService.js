import axios from "../configurations/httpClient";
import { CONFIG         } from "../configurations/configuration";
import { getToken } from './localStorageService';

const BASE_URL = `${CONFIG.API_GATEWAY}/api/admin/statistics`;

// Helper to create axios instance with auth
const createAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============== DASHBOARD SUMMARY ==============

export const getDashboardSummary = async (fromDate, toDate) => {
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

// ============== ORDERS ==============

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

// ============== USERS ==============

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

// ============== REPORTS ==============

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

    const token = getToken();
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

    const token = getToken();
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

    const token = getToken();
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

    const token = getToken();
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
