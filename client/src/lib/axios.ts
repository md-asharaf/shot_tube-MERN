import axios from "axios";
import { ApiResponse } from "@/interfaces";
import { store } from "@/store/store";
import { setLoginPopoverData } from "@/store/reducers/ui";
import { logout } from "@/store/reducers/auth";
import { authService } from "@/services/auth";

const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_BASE_URL,
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response.data.data,
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
class Axios {
    get<T = any>(url: string): Promise<T> {
        return axiosInstance.get(url);
    }
    post<T = any>(url: string, data?: any): Promise<T> {
        return axiosInstance.post(url, data);
    }
    put<T = any>(url: string, data?: any): Promise<T> {
        return axiosInstance.put(url, data);
    }
    patch<T = any>(url: string, data?: any): Promise<T> {
        return axiosInstance.patch(url, data);
    }
    delete<T = any>(url: string): Promise<T> {
        return axiosInstance.delete(url);
    }
}

export default new Axios();
