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

const Channel = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const { username } = useParams<{ username: string }>();
    const fetchUserData = async () => {
        const res = await userServices.getUser(username);
        return res.data;
    };
    const fetchUserVideos = async () => {
        const res = await videoServices.allVideosByUser(user?._id);
        return res.data;
    };
    // Fetch user data
    const { data: user, isLoading: userLoading } = useQuery<IUser>({
        queryKey: ["user", username],
        queryFn: fetchUserData,
        enabled: !!username,
    });

    // Fetch videos by user
    const { data: videos, isLoading: videosLoading } = useQuery<IVideoData[]>({
        queryKey: ["videos", user?._id],
        queryFn: fetchUserVideos,
        enabled: !!user,
    });

    if (userLoading || videosLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-2 w-full">
            {userData?.username === username && (
                <img
                    className="w-full h-32 rounded-xl"
                    src={user?.coverImage?.url || DefaultCoverImage}
                    alt="User cover"
                />
            )}
            <div className="flex space-x-8 justify-center rounded-2xl">
                <img
                    src={user?.avatar?.url || DefaultAvatarImage}
                    className="rounded-full h-40 w-40"
                    alt="User avatar"
                />
                <div className="space-y-2">
                    <div className="font-bold text-3xl">{user?.fullname}</div>
                    <div className="text-gray-500">{`@${user?.username} • ${
                        user?.subscriberCount
                    } subscribers • ${videos?.length || 0} videos`}</div>
                </div>
            </div>
            <span className="text-xl font-semibold text-gray-600 mt-12 border-b-2 pb-2 border-b-zinc-900">
                videos
            </span>
            <hr className="border-gray-400" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {videos?.map((video, index) => (
                    <Link
                        to={`/videos/${video._id}`}
                        onClick={() => dispatch(toggleMenu())}
                        key={index}
                        className=" bg-white rounded-xl overflow-hidden transition-shadow duration-300 cursor-pointer p-2 hover:bg-zinc-300"
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
