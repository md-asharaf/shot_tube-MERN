import { IPlaylist } from "@/interfaces";
import { useSuccess } from "@/lib/utils";
import playlistServices from "@/services/playlist.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDispatch } from "react-redux";
interface Props {
    userId: string;
    setPLaylistIds: React.Dispatch<React.SetStateAction<string[]>>;
}
const SaveToPlaylist: React.FC<Props> = ({ userId, setPLaylistIds }) => {
    const dispatch = useDispatch();
    const successfull = useSuccess(dispatch);
    const [playlistName, setPlaylistName] = useState<string>("");
    const [hidden, setHidden] = useState<boolean>(true);
    const getPlaylists = async () => {
        const res = await playlistServices.getPlaylists(userId);
        return res.data;
    };
    const createPlaylistMutation = async () => {
        const res = await playlistServices.create(playlistName);
        if (successfull(res)) {
            setHidden(true);
            refetch();
        }
    };
    const {
        data: playlists,
        isError,
        error,
        isLoading,
        refetch,
    } = useQuery<IPlaylist[]>({
        queryKey: ["playlists", userId],
        queryFn: getPlaylists,
    });
    const { mutate: createPlaylist } = useMutation({
        mutationFn: createPlaylistMutation,
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
            <div
                hidden={!hidden}
                onClick={() => setHidden(false)}
                className="text-sm cursor-pointer flex items-center justify-center space-x-2 overflow-hidden"
            >
                <span className="text-4xl" hidden={!hidden}>
                    +
                </span>
                <span hidden={!hidden}>create a new playlist</span>
            </div>
            <div hidden={hidden}>
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    className="max-w-full rounded-lg"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                />
                <button
                    className="text-blue-500 text-center w-full mt-4"
                    onClick={() => createPlaylist()}
                >
                    create
                </button>
            </div>
        </div>
    );
};

export default SaveToPlaylist;
