import { RootState } from "@/provider";
import { useSelector } from "react-redux";
import DefaultAvatarImage from "@/assets/images/profile.png";
import { IPlaylist, IVideoData } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";
import Library from "../components/root/Library";
import subscriptionServices from "@/services/subscription.services";
import { Loader2 } from "lucide-react";
import userServices from "@/services/user.services";
const PlaylistNhistory = () => {
    const userData = useSelector((state: RootState) => state.auth.userData);
    const { data: subscriberCount } = useQuery({
        queryKey: ["subscriberCount", userData?._id],
        queryFn: async ():Promise<number> => {
            const data = await subscriptionServices.getSubscribersCount(
                userData?._id
            );
            return data.subscribersCount;
        },
        enabled: !!userData,
    });
    const { data: videos} = useQuery({
        queryKey: ["videos", userData?._id],
        queryFn: async ():Promise<IVideoData[]> => {
            const data = await userServices.getWatchHistory();
            return data.watchHistory;
        },
        enabled: !!userData,
    });
    const { data: playlists, isLoading } = useQuery({
        queryKey: ["playlists", userData?._id],
        queryFn: async ():Promise<IPlaylist[]> => {
            const data = await playlistServices.getAllPlaylists(userData?._id);
            return data.playlists;
        },
        enabled: !!userData?._id,
    });
    if (isLoading) {
        return (
            <div className="flex w-[90%] justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    return (
        <div className="w-full dark:text-white overflow-auto space-y-2">
            <div className="space-x-8 justify-center rounded-2xl hidden sm:flex">
                <img
                    src={userData?.avatar || DefaultAvatarImage}
                    className="rounded-full h-32 w-32"
                    alt="User avatar"
                    loading="lazy"
                />
                <div className="space-y-2">
                    <div className="font-bold text-3xl">
                        {userData?.fullname}
                    </div>
                    <div className="text-gray-500 dark:text-zinc-300">{`@${
                        userData?.username
                    } • ${subscriberCount} subscribers • ${
                        videos?.length || 0
                    } videos`}</div>
                </div>
            </div>
            <div className="space-y-16">
                {videos?.length > 0 && <Library videos={videos} />}
                {playlists?.length > 0 && <Library playlists={playlists} />}
            </div>
        </div>
    );
};

export default PlaylistNhistory;
