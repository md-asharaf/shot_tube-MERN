import Axios from "@/config/request";
class PLaylistService {
    getAllPlaylists = async (userId: string) =>
        await Axios.get(`/playlists/all-playlists/${userId}`);
    getPlaylistById = async (playlistId: string) =>
        await Axios.get(`/playlists/${playlistId}`);
    addVideoToPlaylist = async (videoId: string, playlistId: string) =>
        await Axios.patch(`/playlists/add-video-to-playlist/${playlistId}/${videoId}`);
    createPlaylist = async (name: string) =>
        await Axios.post(`/playlists/create-playlist`, { name, description: "" });
    removeVideoFromPlaylist = async (videoId: string, playlistId: string) =>
        await Axios.patch(`/playlists/remove-video-from-playlist/${playlistId}/${videoId}`);
}
export default new PLaylistService();
