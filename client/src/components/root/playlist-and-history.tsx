import { useSelector } from "react-redux";
import { IShortData, IVideoData, Playlist } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import { playlistService } from "@/services/playlist";
import { subService } from "@/services/subscription";
import { Loader2 } from "lucide-react";
import { userService } from "@/services/user";
import { videoService } from "@/services/video";
import { RootState } from "@/store/store";
import { Library } from "@/components/root/library";
import { AvatarImg } from "@/components/root/avatar-image";

export const PlaylistNhistory = () => {
    const userData = useSelector((state: RootState) => state.auth.userData);

    const { data: subscriberCount } = useQuery({
        queryKey: ["subscriberCount", userData?._id],
        queryFn: async (): Promise<number> => {
            const data = await subService.getSubscribersCount(userData?._id);
            return data.subscribersCount;
        },
        enabled: !!userData,
    });

    const { data: watchHistory, isLoading: loadingHistory } = useQuery({
        queryKey: ["watch-history", userData?._id],
        queryFn: async (): Promise<{
            videos: IVideoData[];
            shorts: IShortData[];
        }> => {
            const data = await userService.getWatchHistory();
            return data.watchHistory;
        },
        enabled: !!userData,
    });

    const { data: playlists, isLoading: loadingPlaylists } = useQuery({
        queryKey: ["playlists", userData?._id],
        queryFn: async (): Promise<Playlist[]> => {
            const data = await playlistService.getAllPlaylists(userData?.username);
            return data.playlists;
        },
        enabled: !!userData?._id,
    });

    const { data: watchLater, isLoading: loadingWatchLater } = useQuery({
        queryKey: ["watch-later", userData?._id],
        queryFn: async (): Promise<{
            videos: IVideoData[];
            shorts: IShortData[];
        }> => {
            const data = await userService.getWatchLater();
            return data.watchLater;
        },
        enabled: !!userData,
    });

    const { data: likedVideos, isLoading: loadingLikedVideos } = useQuery({
        queryKey: ["liked-videos", userData?._id],
        queryFn: async (): Promise<IVideoData[]> => {
            const data = await videoService.likedVideos();
            return data.likedVideos;
        },
        enabled: !!userData?._id,
    });

    if (
        loadingHistory ||
        loadingPlaylists ||
        loadingWatchLater ||
        loadingLikedVideos
    ) {
        return (
            <div className="flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full overflow-auto space-y-6">
            <div className="hidden sm:flex items-center justify-center space-x-6">
                <AvatarImg
                    avatar={userData?.avatar}
                    fullname={userData?.fullname}
                    className="rounded-full h-28 w-28"
                />
                <div className="space-y-2">
                    <div className="font-bold text-3xl">
                        {userData?.fullname}
                    </div>
                    <div className="text-muted-foreground">{`@${
                        userData?.username
                    } • ${subscriberCount} subscribers • ${
                        watchHistory?.videos.length +
                            watchHistory?.shorts.length || 0
                    } videos`}</div>
                </div>
            </div>

            <div className="space-y-10">
                {watchHistory?.videos.length > 0 && (
                    <Library
                        videos={watchHistory.videos}
                        label="Watch History"
                    />
                )}
                {playlists?.length > 0 && (
                    <Library playlists={playlists} label="Playlists" />
                )}
                {watchLater?.videos.length > 0 && (
                    <Library videos={watchLater.videos} label="Watch Later" />
                )}
                {likedVideos?.length > 0 && (
                    <Library videos={likedVideos} label="Liked Videos" />
                )}
            </div>
        </div>
    );
};
