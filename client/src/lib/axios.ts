import axios from "axios";
import { ApiResponse } from "@/interfaces";
import { store } from "@/store/store";
import { setLoginPopoverData } from "@/store/reducers/ui";
import { logout } from "@/store/reducers/auth";
import { authService } from "@/services/auth";
const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_BASE_URL,
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response.data.data;
    },
    (error) => {
        if (
            error.response?.status === 401 &&
            !store.getState().ui.loginPopoverData.open
        ) {
            store.dispatch(logout());
            authService.logout();
            store.dispatch(
                setLoginPopoverData({
                    message: error.response?.data?.message,
                    open: true,
                })
            );
        }
        return Promise.reject(error.response?.data as ApiResponse);
    }
);

const formdataConfig = {
    headers: {
        "content-type": "multipart/form-data",
    },
    withCredentials: true,
};
const jsonConfig = {
    headers: {
        "content-type": "application/json",
    },
    withCredentials: true,
};
const defaultConfig = {
    withCredentials: true,
};

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
