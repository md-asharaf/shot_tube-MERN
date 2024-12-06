import { IPlaylist } from "@/interfaces";
import { RootState } from "@/provider";
import { useSelector } from "react-redux";
import PlaylistCard from "@/components/root/PlaylistCard";
import VideoTitle2 from "@/components/root/VideoTitle2";
import { Link } from "react-router-dom";
import playlistServices from "@/services/playlist.services";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const PlayLists = () => {
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const fetchPlaylists = async () => {
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
        queryFn: fetchPlaylists,
        enabled: !!userId,
    });
    if (isLoading) {
        return (
            <div className="flex w-[90%] justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    if (isError) return <div>Error: {error.message}</div>;
    return (
        <div className="px-2 dark:text-white w-full">
            <h1 className="text-4xl font-bold mb-3">
                {playlists?.length > 0 ? "Playlists" : "No playlists yet"}
            </h1>
            <hr />
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {playlists?.map((playlist) => (
                    <Link
                        to={`/playlist/${playlist._id}`}
                        key={playlist._id}
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
