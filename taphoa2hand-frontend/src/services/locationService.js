import { API } from "../configurations/configuration";
import httpClient from "../configurations/httpClient";

/**
 * Lấy danh sách tỉnh/thành qua Spring Boot (RestTemplate → provinces.open-api.vn).
 * @returns {Promise<{ code: number, message?: string, result?: Array<{ code: number, name: string }> }>}
 */
export const getProvinces = async () => {
    const response = await httpClient.get(API.GET_LOCATION_PROVINCES);
    return response.data;
};

/**
 * Lấy toàn bộ phường/xã thuộc một tỉnh/thành (backend gom từ quận/huyện).
 * @param {string|number} provinceCode mã tỉnh (vd: 79)
 */
export const getWardsByProvince = async (provinceCode) => {
    const response = await httpClient.get(API.GET_LOCATION_WARDS_BY_PROVINCE(provinceCode));
    return response.data;
};
