import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

export const getAllReports = async () => {
    const response = await httpClient.get(API.ADMIN_GET_ALL_REPORTS, { headers: headers() });
    return response.data.result;
};

export const getReportById = async (reportId) => {
    const response = await httpClient.get(API.ADMIN_GET_REPORT_BY_ID(reportId), { headers: headers() });
    return response.data.result;
};

export const getReportsByStatus = async (status) => {
    const response = await httpClient.get(API.ADMIN_GET_REPORTS_BY_STATUS(status), { headers: headers() });
    return response.data.result;
};

export const getReportsPaged = async ({
    keyword = '',
    status = '',
    type = '',
    fromDate = '',
    toDate = '',
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir = 'desc',
} = {}) => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);

    const response = await httpClient.get(`${API.ADMIN_REPORTS_PAGED}?${params.toString()}`, {
        headers: headers()
    });
    return response.data.result;
};

export const getReportStats = async () => {
    const response = await httpClient.get(API.ADMIN_REPORTS_STATS, { headers: headers() });
    return response.data.result;
};

export const updateReportStatus = async (reportId, status) => {
    const response = await httpClient.put(
        API.ADMIN_UPDATE_REPORT_STATUS(reportId),
        { status },
        { headers: { ...headers(), 'Content-Type': 'application/json' } }
    );
    return response.data.result;
};

export const reviewReport = async (reportId, payload) => {
    const response = await httpClient.post(
        API.ADMIN_REVIEW_REPORT(reportId),
        payload,
        { headers: { ...headers(), 'Content-Type': 'application/json' } }
    );
    return response.data.result;
};

// ═══════════════════════════════════════════
// REPORTS BY TYPE (USER / ORDER / POST)
// ═══════════════════════════════════════════

/**
 * TODO: Implement logic to fetch user reports
 */
export const getUserReports = async () => {
    const response = await httpClient.get(API.ADMIN_GET_USER_REPORTS, { headers: headers() });
    return response.data.result;
};

/**
 * TODO: Implement logic to fetch user reports with pagination
 */
export const getUserReportsPaged = async (page = 0, size = 10) => {
    const response = await httpClient.get(API.ADMIN_GET_USER_REPORTS_PAGED, {
        params: { page, size },
        headers: headers()
    });
    return response.data.result;
};

/**
 * TODO: Implement logic to fetch order reports
 */
export const getOrderReports = async () => {
    const response = await httpClient.get(API.ADMIN_GET_ORDER_REPORTS, { headers: headers() });
    return response.data.result;
};

/**
 * TODO: Implement logic to fetch order reports with pagination
 */
export const getOrderReportsPaged = async (page = 0, size = 10) => {
    const response = await httpClient.get(API.ADMIN_GET_ORDER_REPORTS_PAGED, {
        params: { page, size },
        headers: headers()
    });
    return response.data.result;
};

/**
 * TODO: Implement logic to fetch post reports
 */
export const getPostReports = async () => {
    const response = await httpClient.get(API.ADMIN_GET_POST_REPORTS, { headers: headers() });
    return response.data.result;
};

/**
 * TODO: Implement logic to fetch post reports with pagination
 */
export const getPostReportsPaged = async (page = 0, size = 10) => {
    const response = await httpClient.get(API.ADMIN_GET_POST_REPORTS_PAGED, {
        params: { page, size },
        headers: headers()
    });
    return response.data.result;
};
