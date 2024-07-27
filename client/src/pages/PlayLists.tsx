import { IPlaylist } from "@/interfaces";
import { RootState } from "@/provider";
import { useDispatch, useSelector } from "react-redux";
import { useSuccess } from "@/lib/utils";
import PlaylistCard from "@/components/root/PlaylistCard";
import VideoTitle2 from "@/components/root/VideoTitle2";
import { Link } from "react-router-dom";
import playlistServices from "@/services/playlist.services";
import { useQuery } from "@tanstack/react-query";

const PlayLists = () => {
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const successfull = useSuccess(dispatch);
    const fetchPlaylists = async () => {
        const res = await playlistServices.getPlaylists(userId);
        if (successfull(res)) {
            return res.data;
        }
    };
    const {
        data: playlists,
        isError,
        error,
        isLoading,
    } = useQuery<IPlaylist[]>({
        queryKey: ["playlists", userId],
        queryFn: fetchPlaylists,
        enabled: !!userId,
    });
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error.message}</div>;
    return (
        <div className="px-2">
            <h1 className="text-4xl font-bold">Playlists</h1>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {playlists.map((playlist, index) => (
                    <Link
                        to={`/playlist/${playlist._id}`}
                        key={index}
                        className="space-y-2 rounded-xl p-2 hover:bg-gray-400 hover:dark:bg-zinc-800"
                    >
                        <PlaylistCard {...playlist} />
                        <VideoTitle2 {...playlist} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default PlayLists;
