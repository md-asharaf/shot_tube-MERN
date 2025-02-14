import Axios from "@/lib/axios";
class PLaylistService {
    getAllPlaylists = async (username: string) =>
        await Axios.get(`/playlists/all-playlists/${username}`);
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
    isSavedToPlaylists = async (id: string, type: string) =>
        await Axios.get(
            `/playlists/is-video-saved?${type}Id=${id}`
        );
}
export const playlistService = new PLaylistService();
