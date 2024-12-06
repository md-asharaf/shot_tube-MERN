import Axios from "@/config/request";
class PLaylistService {
    getPlaylists = async (userId: string) =>
        await Axios.get(`/playlists/${userId}/all-playlists`);
    getPlaylist = async (playlistId: string) =>
        await Axios.get(`/playlists/${playlistId}`);
    addVideoToPlaylist = async (videoId: string, playlistId: string) =>
        await Axios.patch(`/playlists/${playlistId}/${videoId}/add`);
    create = async (name: string) =>
        await Axios.post(`/playlists/create`, { name, description: "" });
    removeVideoFromPlaylist = async (videoId: string, playlistId: string) =>
        await Axios.patch(`/playlists/${playlistId}/${videoId}/remove`);
}
export default new PLaylistService();
