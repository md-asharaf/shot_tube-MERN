import { IPlaylist } from "@/interfaces";
import playlistServices from "@/services/playlist.services";
import { useQuery } from "@tanstack/react-query";
interface Props {
    userId: string;
    setPLaylistIds: React.Dispatch<React.SetStateAction<string[]>>;
}
const SaveToPlaylist: React.FC<Props> = ({ userId, setPLaylistIds }) => {
    const getPlaylists = async () => {
        const res = await playlistServices.getPlaylists(userId);
        return res.data;
    };
    const {
        data: playlists,
        isError,
        error,
        isLoading,
    } = useQuery<IPlaylist[]>({
        queryKey: ["playlists", userId],
        queryFn: getPlaylists,
    });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <div className="p-1 space-y-4">
            <span>Save video to... </span>
            {playlists?.map((playlist, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        onChange={(e) => {
                            if (e.target.checked) {
                                setPLaylistIds((prev) => [
                                    ...prev,
                                    playlist._id,
                                ]);
                            } else {
                                setPLaylistIds((prev) =>
                                    prev.filter((id) => id !== playlist._id)
                                );
                            }
                        }}
                    />
                    <span>{playlist.name}</span>
                </div>
            ))}
        </div>
    );
};

export default SaveToPlaylist;
