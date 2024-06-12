import Axios from "../config/request";

class UserService {
    getUser = async (username: string) =>
        await Axios.get(`users/channel/${username}`);
    getCurrentUser = async () => await Axios.get("/users/current-user");
}

export default new UserService();
