import Axios from "@/config/request";
class PLaylistService {
    getPlaylists = async (userId: string) =>
        await Axios.get(`/playlists/${userId}/all-playlists`);
}
export default new PLaylistService();