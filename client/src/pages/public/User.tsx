import { Link, useParams, useSearchParams } from "react-router-dom";
import { IUser, IVideoData } from "@/interfaces";
import userServices from "@/services/User";
import VideoCard from "@/components/VideoCard";
import { useDispatch, useSelector } from "react-redux";
import DefaultCoverImage from "@/assets/images/coverImage.jpg";
import videoServices from "@/services/Video";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import subscriptionServices from "@/services/Subscription";
import { Loader2 } from "lucide-react";
import { RootState } from "@/store/store";
import { toggleMenu } from "@/store/reducers/ui";
import AvatarImg from "@/components/AvatarImg";
import NavigationMenu from "@/components/nav-menu";

const User = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const { username } = useParams();

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
    const items = [
        { name: "All", path: "" },
        { name: "Videos", path: "videos" },
        { name: "Shorts", path: "shorts" },
        { name: "Playlists", path: "playlists" },
        { name: "Posts", path: "posts" },
    ];
    return (
        <div className="space-y-4 w-full">
            {userData?.username === username && (
                <img
                    className="w-full h-20 sm:h-32 rounded-lg"
                    src={userDetails?.user?.coverImage || DefaultCoverImage}
                    loading="lazy"
                    alt="Cover"
                />
            )}
            <div className="flex space-x-2 sm:space-x-6 justify-center">
                <AvatarImg
                    className="rounded-full h-16 sm:h-24 w-16 sm:w-24"
                    avatar={userDetails?.user?.avatar}
                    fullname={userDetails?.user?.fullname}
                />
                <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold">
                        {userDetails?.user?.fullname}
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">{`@${
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
            <NavigationMenu data={items}/>
            <h3 className="text-xl font-semibold">Videos</h3>
            <hr />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                            className="flex flex-col space-y-2 rounded-lg"
                        >
                            <VideoCard video={video} />
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default User;
