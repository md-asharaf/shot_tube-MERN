import { Link, useParams } from "react-router-dom";
import { IUser, IVideoData } from "@/interfaces";
import userServices from "@/services/user.services";
import VideoCard from "@/components/root/VideoCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, toggleMenu } from "@/provider";
import DefaultAvatarImage from "@/assets/images/profile.png";
import DefaultCoverImage from "@/assets/images/coverImage.jpg";
import VideoTitle from "@/components/root/VideoTitle";
import videoServices from "@/services/video.services";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import subscriptionServices from "@/services/subscription.services";
import { Loader2 } from "lucide-react";

const Channel = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const { username } = useParams<{ username: string }>();
    // Fetch user data
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ["user", username],
        queryFn: async ():Promise<IUser> => {
            const res = await userServices.getUserChannel(username);
            return res.data;
        },
        enabled: !!username,
    });
    const { data: isSubscribed, refetch } = useQuery({
        queryKey: ["isSubscribed", user?._id],
        queryFn: async ():Promise<boolean> => {
            const res = await subscriptionServices.isChannelSubscribed(user?._id);
            return res.data.isSubscribed;
        },
        enabled: !!user,
    });
    // Fetch videos by user
    const { data: videos, isLoading: videosLoading } = useQuery({
        queryKey: ["videos", user?._id],
        queryFn: async ():Promise<IVideoData[]> => {
            const res = await videoServices.allVideosByUser(user?._id);
            return res.data;
        },
        enabled: !!user,
    });

    if (userLoading || videosLoading) {
        return (
            <div className="flex w-[90%] justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    return (
        <div className="space-y-2 w-full dark:text-white">
            {userData?.username === username && (
                <img
                    className="w-full h-24 sm:h-32 rounded-xl"
                    src={user?.coverImage || DefaultCoverImage}
                    alt="User cover"
                    loading="lazy"
                />
            )}
            <div className="flex space-x-4 sm:space-x-8 justify-center rounded-2xl">
                <img
                    src={user?.avatar || DefaultAvatarImage}
                    className="rounded-full h-24 w-24 sm:h-40 sm:w-40"
                    alt="User avatar"
                />
                <div className="space-y-2">
                    <div className="font-bold text-2xl sm:text-3xl">{user?.fullname}</div>
                    <div className="text-gray-500 dark:text-zinc-300">{`@${
                        user?.username
                    } • ${user?.subscriberCount} subscribers • ${
                        videos?.length || 0
                    } videos`}</div>
                    {userData?.username != username && (
                        <Button
                            className={`rounded-full ${
                                !isSubscribed && "bg-red-500 hover:bg-red-500"
                            } `}
                            onClick={async () => {
                                await subscriptionServices.toggleSubscription(
                                    user?._id
                                );
                                refetch();
                            }}
                        >
                            {isSubscribed ? "Unsubscribe" : "Subscribe"}
                        </Button>
                    )}
                </div>
            </div>
            <span className="text-xl font-semibold text-gray-600 dark:text-zinc-300 mt-12 border-b-2 pb-2 border-b-zinc-900">
                videos
            </span>
            <hr className="border-gray-400" />
            <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {videos?.map((video, index) => (
                    <Link
                        to={`/videos/${video._id}`}
                        onClick={() => dispatch(toggleMenu())}
                        key={index}
                        className="flex flex-col gap-4 rounded-xl transition-shadow duration-300 cursor-pointer p-2 hover:bg-zinc-200 hover:dark:bg-zinc-800"
                    >
                        <VideoCard video={video} />
                        <VideoTitle video={video} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Channel;
