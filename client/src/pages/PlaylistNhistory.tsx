import { RootState } from "@/provider";
import { useSelector } from "react-redux";
import DefaultAvatarImage from "@/assets/images/profile.png";
import { IPlaylist, IVideoData } from "@/interfaces";
import { useQuery } from "@tanstack/react-query";
import videoServices from "@/services/video.services";
import playlistServices from "@/services/playlist.services";
import Slider from "../components/root/Slider";
import subscriptionServices from "@/services/subscription.services";
const PlaylistNhistory = () => {
    const userData = useSelector((state: RootState) => state.auth.userData);
    const fetchUserVideos = async () => {
        const res = await videoServices.allVideosByUser(userData?._id);
        return res.data;
    };
    const fetchPlaylists = async () => {
        const res = await playlistServices.getPlaylists(userData?._id);
        return res.data;
    };
    const { data: subscriberCount } = useQuery<number>({
        queryKey: ["subscriberCount", userData?._id],
        queryFn: async () => {
            const res = await subscriptionServices.getSubscribersCount(
                userData?._id
            );
            return res.data;
        },
        enabled: !!userData,
    });
    const { data: videos, isLoading: videosLoading } = useQuery<IVideoData[]>({
        queryKey: ["videos", userData?._id],
        queryFn: fetchUserVideos,
        enabled: !!userData,
    });
    const { data: playlists, isLoading } = useQuery<IPlaylist[]>({
        queryKey: ["playlists", userData?._id],
        queryFn: fetchPlaylists,
        enabled: !!userData?._id,
    });
    if (isLoading || videosLoading) return <div>Loading...</div>;
    return (
        <div className="w-full dark:text-white overflow-auto space-y-2">
            <div className="space-x-8 justify-center rounded-2xl hidden sm:flex">
                <img
                    src={userData?.avatar?.url || DefaultAvatarImage}
                    className="rounded-full h-32 w-32"
                    alt="User avatar"
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
                {videos?.length > 0 && <Slider videos={videos} />}
                {playlists?.length > 0 && <Slider playlists={playlists} />}
            </div>
        </div>
    );
};

export default PlaylistNhistory;
