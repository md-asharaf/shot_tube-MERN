import Axios from "../config/request";

class UserService {
    async getUser(username: string) {
        return await Axios.get(`users/channel/${username}`);
    }
}

export default new UserService();
