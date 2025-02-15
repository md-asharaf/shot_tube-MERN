import Axios from "../lib/axios";

class UserService {
    getUserChannel = async (username: string) =>
        await Axios.get(`/users/channel/${username}`);
    getCurrentUser = async () => await Axios.get("/users/current-user");
    addToWatchHistory = async (id: string,type:string) =>
        await Axios.post(`/users/add-to-watch-history?${type}Id=${id}`);
    removeFromWatchHistory = async (id: string,type:string) =>
        await Axios.delete(`/users/remove-from-watch-history?${type}Id=${id}`);
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
    saveToWatchLater = async (id:string,type:string) =>
        await Axios.post(`/users/save-to-watch-later?${type}Id=${id}`);
    removeFromWatchLater = async (id: string,type:string) => 
        await Axios.patch(`/users/remove-from-watch-later?${type}Id=${id}`);
    isSavedToWatchLater = async (id: string,type:string) =>
        await Axios.get(`/users/is-saved-to-watch-later?${type}Id=${id}`);
}

export const userService = new UserService();
