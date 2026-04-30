import { CONFIG, API } from "../configurations/configuration";
import { getToken } from "./localstorageService";

// =========================================================
// BANNER API
// =========================================================
        const token = getToken();
export const getActiveBanners = async () => {
    try {
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.GET_BANNERS}`, {
            method: "GET",
            headers: {
                
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API getActiveBanners:", error);
        throw error;
    }
};

export const getAllBanners = async () => {
    try {

        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_GET_BANNERS}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API getAllBanners:", error);
        throw error;
    }
};

export const getBannerById = async (bannerId) => {
    try {
        const token = getToken();
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_GET_BANNER_DETAIL(bannerId)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API getBannerById:", error);
        throw error;
    }
};

export const createBanner = async (bannerData, desktopFile, mobileFile) => {
    try {
        const token = getToken();
        const formData = new FormData();
        
        // Append text fields
        formData.append('title', bannerData.title);
        if (bannerData.targetUrl) formData.append('targetUrl', bannerData.targetUrl);
        if (bannerData.sortOrder) formData.append('sortOrder', bannerData.sortOrder);
        if (bannerData.isActive !== undefined) formData.append('isActive', bannerData.isActive);
        if (bannerData.startDate) formData.append('startDate', bannerData.startDate);
        if (bannerData.endDate) formData.append('endDate', bannerData.endDate);
        
        // Append files
        if (desktopFile) formData.append('desktopFile', desktopFile);
        if (mobileFile) formData.append('mobileFile', mobileFile);

        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_CREATE_BANNER}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API createBanner:", error);
        throw error;
    }
};

export const updateBanner = async (bannerId, bannerData) => {
    try {
        const token = getToken();
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_UPDATE_BANNER(bannerId)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(bannerData)
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API updateBanner:", error);
        throw error;
    }
};

export const deleteBanner = async (bannerId) => {
    try {
        const token = getToken();
        const response = await fetch(`${CONFIG.API_GATEWAY}${API.ADMIN_DELETE_BANNER(bannerId)}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Lỗi gọi API deleteBanner:", error);
        throw error;
    }
};