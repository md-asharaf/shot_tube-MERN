import Axios from "../config/request";

class UserService {
    getUserChannel = async (username: string) =>
        await Axios.get(`/users/channel/${username}`);
    getCurrentUser = async () => await Axios.get("/users/current-user");
    addVideoToWatchHistory = async (videoId: string) =>
        await Axios.post(`/users/add-to-watch-history/${videoId}`);
    removeFromWatchHistory = async (videoId: string) =>
        await Axios.delete(`/users/remove-from-watch-history/${videoId}`);
    getWatchHistory = async () => await Axios.get("/users/watch-history");
    clearWatchHistory = async () => await Axios.delete("/users/clear-watch-history");
    getUsersBySearchText = async (searchText: string) =>
        await Axios.get(`/users/get-users?search=${searchText}`);
    resetPassword = async (resetToken: string, password: string) =>
        await Axios.patch("/users/reset-password", {
            resetToken,
            password,
        });
}

export default new UserService();
