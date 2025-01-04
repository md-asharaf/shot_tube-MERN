import Axios from "@/lib/axios";
import { ILoginForm, IRegisterForm } from "@/interfaces";

class AuthService {
    login = async (data: ILoginForm) => await Axios.post("/users/login", data);
    logout = async () => await Axios.get("/users/logout");
    register = async (data: IRegisterForm) =>
        await Axios.post("/users/register", data);
    googleLogin = async (data: object) =>
        await Axios.post("/users/google-login", data);
    sendResetLinkOnEmail = async (email: string) =>
        await Axios.post("/users/forget-password", { email });
}

export default new AuthService();
