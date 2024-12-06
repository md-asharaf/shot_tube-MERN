import Axios from "../config/request";

class UserService {
    getUser = async (username: string) =>
        await Axios.get(`users/channel/${username}`);
    getCurrentUser = async () => await Axios.get("/users/current-user");
    addToWatchHistory = async (videoId: string) =>
        await Axios.post(`/users/watch-history/${videoId}/add`);
    removeFromWatchHistory = async (videoId: string) => 
        await Axios.delete(`/users/watch-history/${videoId}/remove`);
    watchHistory = async () => await Axios.get("/users/watch-history");
    clearHistory = async () => await Axios.delete("/users/watch-history/clear");
}

export default new UserService();
