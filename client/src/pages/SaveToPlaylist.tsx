import { IPlaylist } from "@/interfaces";
import playlistServices from "@/services/playlist.services";
import { useQuery } from "@tanstack/react-query";

const SaveToPlaylist = ({ userId, setPLaylistIds }) => {
    const {
        data: playlists,
        isError,
        error,
        isLoading,
    } = useQuery({
        queryKey: ["playlists", userId],
        queryFn: async (): Promise<IPlaylist[]> => {
            const res = await playlistServices.getPlaylists(userId);
            return res.data;
        },
    });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <div className="p-1 space-y-4">
            <span>Save video to... </span>
            {playlists?.map((playlist, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span>{playlist.name}</span>
                </div>
            ))}
        </div>
    );
};

export default SaveToPlaylist;
