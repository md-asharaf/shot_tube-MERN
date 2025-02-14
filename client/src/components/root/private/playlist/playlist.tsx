import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { playlistService } from "@/services/Playlist";
import { IPlaylist } from "@/interfaces";
import { Loader2 } from "lucide-react";
import { PlaylistComp } from "@/components/root/private/playlist/playlist-comp";

export const Playlist = () => {
    const [searchParams] = useSearchParams();
    const playlistId = searchParams.get("p");
    const {
        data: playlist,
        isError,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["playlist", playlistId],
        queryFn: async (): Promise<IPlaylist> => {
            const data = await playlistService.getPlaylistById(playlistId);
            return data.playlist;
        },
        enabled: !!playlistId,
    });
    if (isLoading) {
        return (
            <div className="flex w-[90%] justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    if (isError) {
        return <div>ERROR: {error.message}</div>;
    }
    if (playlist.videos.length === 0)
        return <div>No videos in this playlist</div>;
    return (
        <PlaylistComp
            playlist={{
                _id: playlist._id,
                name: playlist.name,
                creator: playlist.creator.fullname,
                updatedAt: playlist.updatedAt,
                description: playlist.description,
                videos: playlist.videos,
                shorts: playlist.shorts,
                totalViews: playlist.videos.reduce(
                    (prev, curr) => prev + curr.views,
                    0
                ),
            }}
        />
    );
};
