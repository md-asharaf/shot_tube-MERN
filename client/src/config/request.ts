import axios from "axios";
import { defaultConfig, jsonConfig, formdataConfig } from ".";
import { ApiResponse } from "@/interfaces";

const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_BASE_URL,
});
axiosInstance.interceptors.response.use(
    (response) => {
        return response.data.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            // showLoginPopover();
        }
        return Promise.reject(error.response?.data as ApiResponse);
    }
);
class Axios {
    get = async (url: string): Promise<any> =>
        await axiosInstance.get(url, defaultConfig);
    post = async (url: string, data: object | FormData = {}): Promise<any> => {
        const config = data instanceof FormData ? formdataConfig : jsonConfig;
        return await axiosInstance.post(url, data, config);
    };
    delete = async (url: string): Promise<any> =>
        await axiosInstance.delete(url, defaultConfig);
    patch = async (url: string, data: object | FormData = {}): Promise<any> => {
        const config = data instanceof FormData ? formdataConfig : jsonConfig;
        return await axiosInstance.patch(url, data, config);
    };
}
export default new Axios();
