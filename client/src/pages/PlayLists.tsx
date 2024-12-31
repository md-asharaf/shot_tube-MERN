import { IPlaylist, IVideoData } from "@/interfaces";
import { RootState } from "@/provider";
import { useSelector } from "react-redux";
import PlaylistCard from "@/components/root/PlaylistCard";
import VideoTitle2 from "@/components/root/VideoTitle2";
import { Link } from "react-router-dom";
import playlistServices from "@/services/playlist.services";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import videoServices from "@/services/video.services";

const PlayLists = () => {
    const {
        _id: userId,
        username,
        fullname,
    } = useSelector((state: RootState) => state.auth?.userData);
    const {
        data: playlists,
        isError,
        error,
        isLoading,
    } = useQuery({
        queryKey: ["playlists", userId],
        queryFn: async (): Promise<IPlaylist[]> => {
            const data = await playlistServices.getAllPlaylists(userId);
            return data.playlists;
        },
        enabled: !!userId,
    });
    const { data: likedVideos } = useQuery({
        queryKey: ["liked-videos", userId],
        queryFn: async (): Promise<IVideoData[]> => {
            const data = await videoServices.likedVideos();
            return data.likedVideos;
        },
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
            <h1 className="text-2xl sm:text-3xl mb-3">
                {playlists?.length > 0 ? "Playlists" : "No playlists yet"}
            </h1>
            <hr />
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {playlists?.map((playlist) => (
                    <Link
                        to={`/playlist/${playlist._id}`}
                        key={playlist._id}
                        className="space-y-2 rounded-xl p-2 hover:bg-gray-400 hover:dark:bg-zinc-800"
                    >
                        <PlaylistCard
                            playlistThumbnail={
                                playlist.videos.length > 0
                                    ? playlist.videos[0].thumbnail
                                    : null
                            }
                            videosLength={playlist.videos.length}
                        />
                        <VideoTitle2
                            playlistName={playlist.name}
                            username={playlist.creator.username}
                            fullname={playlist.creator.fullname}
                        />
                    </Link>
                ))}
                {likedVideos && (
                    <Link
                        to="/playlist/liked-videos"
                        className="space-y-2 rounded-xl p-2 hover:bg-gray-400 hover:dark:bg-zinc-800"
                    >
                        <PlaylistCard
                            playlistThumbnail={
                                likedVideos.length > 0
                                    ? likedVideos[0].thumbnail
                                    : null
                            }
                            videosLength={likedVideos.length}
                        />
                        <VideoTitle2
                            playlistName="Liked Videos"
                            username={username}
                            fullname={fullname}
                        />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default PlayLists;
