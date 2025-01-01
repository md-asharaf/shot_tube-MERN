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
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import subscriptionServices from "@/services/subscription.services";
import { Loader2 } from "lucide-react";
const Channel = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const { username } = useParams();
    const { data: userDetails, isLoading: userLoading } = useQuery({
        queryKey: ["user-details", username],
        queryFn: async (): Promise<{
            user: IUser;
            subscribersCount: number;
        }> => {
            const data = await userServices.getUserChannel(username);
            return data.channel;
        },
        enabled: !!username,
    });
    const { data: isSubscribed, refetch } = useQuery({
        queryKey: ["isSubscribed", userDetails?.user?._id],
        queryFn: async (): Promise<boolean> => {
            const data = await subscriptionServices.isChannelSubscribed(
                userDetails?.user?._id
            );
            return data.isSubscribed;
        },
        enabled: !!userDetails?.user,
    });
    const { data: userVideos, isLoading: videosLoading } = useQuery({
        queryKey: ["videos", userDetails?.user?._id],
        queryFn: async (): Promise<IVideoData[]> => {
            const data = await videoServices.allVideosByUser(userDetails?.user?._id);
            return data.videos;
        },
        enabled: !!userDetails?.user,
    });

    const { mutate: toggleSubscription } = useMutation({
        mutationFn: async () => {
            await subscriptionServices.toggleSubscription(
                userDetails?.user?._id
            );
        },
        onSuccess: () => {
            refetch();
            return true;
        },
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
                    src={userDetails?.user?.coverImage || DefaultCoverImage}
                    loading="lazy"
                />
            )}
            <div className="flex space-x-4 sm:space-x-8 justify-center rounded-2xl">
                <img
                    src={userDetails?.user?.avatar || DefaultAvatarImage}
                    className="rounded-full h-24 w-24 sm:h-40 sm:w-40"
                />
                <div className="space-y-2">
                    <div className="font-bold text-2xl sm:text-3xl">
                        {userDetails?.user?.fullname}
                    </div>
                    <div className="text-gray-500 dark:text-zinc-300">{`@${
                        userDetails?.user?.username
                    } • ${userDetails?.subscribersCount} subscribers • ${
                        userVideos?.length || 0
                    } videos`}</div>
                    {userData?.username != username && (
                        <Button
                            className={`rounded-full ${
                                !isSubscribed && "bg-red-500 hover:bg-red-500"
                            } `}
                            onClick={() => toggleSubscription()}
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
                {userVideos?.map((video, index) => (
                    <Link
                        to={`/videos/${video._id}`}
                        onClick={() => dispatch(toggleMenu())}
                        key={index}
                        className="flex flex-col gap-4 rounded-xl transition-shadow duration-300 cursor-pointer p-2 hover:bg-zinc-200 hover:dark:bg-zinc-800"
                    >
                        <VideoCard
                            thumbnail={video.thumbnail}
                            duration={video.duration}
                        />
                        <VideoTitle
                            video={{
                                _id: video._id,
                                views: video.views,
                                title: video.title,
                                createdAt: video.createdAt,
                            }}
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Channel;
