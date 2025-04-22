import axios from "@/lib/axios";
import { ILoginForm, IRegisterForm } from "@/interfaces";

class AuthService {
    login = async (data: ILoginForm) => await axios.post("/users/login", data);
    logout = async () => await axios.get("/users/logout");
    register = async (data: IRegisterForm) =>
        await axios.post("/users/register", data);
    googleLogin = async (data: object) =>
        await axios.post("/users/google-login", data);
    sendResetLinkOnEmail = async (email: string) =>
        await axios.post("/users/forget-password", { email });
    loginViaRefreshToken = async () => await axios.get("/users/refresh-tokens");
}

export const authService = new AuthService();
