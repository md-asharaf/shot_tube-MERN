import axios from "axios";
import { defaultConfig, jsonConfig, formdataConfig } from ".";
const axio = axios.create({
    baseURL: "https://shot-tube-mern.onrender.com",
});
class Axios {
    get = async (url: string) => {
        try {
            const res = await axio.get(url, defaultConfig);
            return res?.data;
        } catch (error) {
            return error.response?.data;
        }
    };
    post = async (url: string, data: object | FormData = {}) => {
        try {
            const config =
                data instanceof FormData ? formdataConfig : jsonConfig;
            const res = await axio.post(url, data, config);
            return res?.data;
        } catch (error) {
            return error.response?.data;
        }
    };
    delete = async (url: string) => {
        try {
            const res = await axio.delete(url, defaultConfig);
            return res?.data;
        } catch (error) {
            return error.response?.data;
        }
    };
    patch = async (url: string, data: object | FormData = {}) => {
        try {
            const config =
                data instanceof FormData ? formdataConfig : jsonConfig;
            const res = await axio.patch(url, data, config);
            return res?.data;
        } catch (error) {
            return error.response?.data;
        }
    };
}
export default new Axios();
