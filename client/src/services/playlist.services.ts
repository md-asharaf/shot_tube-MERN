import Axios from "@/config/request";
class PLaylistService {
    getPlaylists = async (userId: string) =>
        await Axios.get(`/playlists/${userId}/all-playlists`);
    getPlaylist = async (playlistId: string) =>
        await Axios.get(`/playlists/${playlistId}`);
    addVideoToPlaylist = async (videoId: string, playlistId: string) =>
        await Axios.patch(`/playlists/${playlistId}/${videoId}/add`);
}
export default new PLaylistService();
