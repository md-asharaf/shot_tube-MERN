import { Link, useSearchParams } from "react-router-dom";
import { IUser, IVideoData } from "@/interfaces";
import userServices from "@/services/User";
import VideoCard from "@/components/VideoCard";
import { useDispatch, useSelector } from "react-redux";
import DefaultAvatarImage from "@/assets/images/profile.png";
import DefaultCoverImage from "@/assets/images/coverImage.jpg";
import VideoTitle from "@/components/VideoTitle";
import videoServices from "@/services/Video";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import subscriptionServices from "@/services/Subscription";
import { Loader2 } from "lucide-react";
import { RootState } from "@/store/store";
import { toggleMenu } from "@/store/reducers/ui";

const Channel = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const [searchParams] = useSearchParams();
    const username = searchParams.get("u");

    const { data: userDetails } = useQuery({
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
        enabled: !!userDetails?.user && !!userData,
    });

    const { data: userVideos, isLoading: videosLoading } = useQuery({
        queryKey: ["videos", userDetails?.user?._id],
        queryFn: async (): Promise<IVideoData[]> => {
            const data = await videoServices.allVideosByUser(
                userDetails?.user?._id
            );
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

    return (
        <div className="space-y-4 w-full">
            {userData?.username === username && (
                <img
                    className="w-full h-32 rounded-lg"
                    src={userDetails?.user?.coverImage || DefaultCoverImage}
                    loading="lazy"
                    alt="Cover"
                />
            )}
            <div className="flex space-x-6 justify-center">
                <img
                    src={userDetails?.user?.avatar || DefaultAvatarImage}
                    className="rounded-full h-24 w-24"
                    alt="Avatar"
                />
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                        {userDetails?.user?.fullname}
                    </h2>
                    <p className="text-muted-foreground">{`@${
                        userDetails?.user?.username
                    } • ${userDetails?.subscribersCount} subscribers • ${
                        userVideos?.length || 0
                    } videos`}</p>
                    {userData?.username !== username && (
                        <Button
                            variant={isSubscribed ? "default" : "destructive"}
                            onClick={() => toggleSubscription()}
                            className="rounded-full"
                        >
                            {isSubscribed ? "Unsubscribe" : "Subscribe"}
                        </Button>
                    )}
                </div>
            </div>
            <h3 className="text-xl font-semibold">Videos</h3>
            <hr />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {videosLoading ? (
                    <div className="flex justify-center w-full">
                        <Loader2 className="h-10 w-10 animate-spin" />
                    </div>
                ) : (
                    userVideos?.map((video, index) => (
                        <Link
                            to={`/video?v=${video._id}`}
                            onClick={() => dispatch(toggleMenu())}
                            key={index}
                            className="flex flex-col space-y-2 rounded-lg hover:bg-muted p-2"
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
                    ))
                )}
            </div>
        </div>
    );
};

export default Channel;
