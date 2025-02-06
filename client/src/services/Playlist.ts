import Axios from "@/lib/axios";
class PLaylistService {
    getAllPlaylists = async (userId: string) =>
        await Axios.get(`/playlists/all-playlists/${userId}`);
    getPlaylistById = async (playlistId: string) =>
        await Axios.get(`/playlists/${playlistId}`);
    addToPlaylist = async (playlistId: string, id: string, type: string) =>
        await Axios.patch(
            `/playlists/add-video-to-playlist/${playlistId}?${type}Id=${id}`
        );
    createPlaylist = async (name: string) =>
        await Axios.post(`/playlists/create-playlist`, {
            name,
            description: "",
        });
    removeFromPlaylist = async (playlistId: string, id: string, type: string) =>
        await Axios.patch(
            `/playlists/remove-video-from-playlist/${playlistId}?${type}Id=${id}`
        );
    isSavedToPlaylist = async (playlistId: string, id: string, type: string) =>
        await Axios.get(
            `/playlists/is-video-saved/${playlistId}?${type}Id=${id}`
        );
}
export default new PLaylistService();
