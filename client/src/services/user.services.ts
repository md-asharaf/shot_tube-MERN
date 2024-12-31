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
    getWatchLater = async () => await Axios.get("/users/watch-later");
    clearWatchHistory = async () =>
        await Axios.delete("/users/clear-watch-history");
    getUsersBySearchText = async (searchText: string) =>
        await Axios.get(`/users/get-users?search=${searchText}`);
    resetPassword = async (resetToken: string, password: string) =>
        await Axios.patch("/users/reset-password", {
            resetToken,
            password,
        });
    saveToWatchLater = async (videoId: string) =>
        await Axios.post(`/users/save-to-watch-later/${videoId}`);
    removeFromWatchLater = async (videoId: string) => 
        await Axios.patch(`/users/remove-from-watch-later/${videoId}`);
    isSavedToWatchLater = async (videoId: string) =>
        await Axios.get(`/users/is-saved-to-watch-later/${videoId}`);
}

export default new UserService();
