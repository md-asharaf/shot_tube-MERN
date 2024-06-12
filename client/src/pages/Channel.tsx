import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IUser, IVideoData } from "@/interfaces";
import userServices from "@/services/user.services";
videoServices
import VideoCard from "@/components/root/VideoCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, toggleMenu } from "@/provider";
import DefaultAvatarImage from "@/assets/images/profile.png";
import DefaultCoverImage from "@/assets/images/coverImage.jpg";
import VideoTitle from "@/components/root/VideoTitle";
import videoServices from "@/services/video.services";
const Channel = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const { username } = useParams();
    const [user, setUser] = useState<IUser>({} as IUser);
    const [videos, setVideos] = useState<IVideoData[]>([]);
    const fetchAndSetUser = async () => {
        const res = await userServices.getUser(username);
        if (res?.data) {
            setUser(res.data);
        }
    };
    const fetchAndSetVideos = async () => {
        const res = await videoServices.getAllVideosByUser(user._id);
        if (res?.data) {
            setVideos(res.data);
        }
    };
    useEffect(() => {
        if (!username) return;
        fetchAndSetUser();
    }, [username]);
    useEffect(() => {
        if (!user) return;
        fetchAndSetVideos();
    }, [user]);
    if (!user) return <div>Loading...</div>;
    return (
        <div className="p-2 space-y-2">
            {userData?.username === username && (
                <img
                    className="w-full h-32 rounded-xl"
                    src={user.coverImage?.url || DefaultCoverImage}
                />
            )}
            <div className="flex space-x-8 justify-center rounded-2xl">
                <img
                    src={user.avatar?.url || DefaultAvatarImage}
                    className="rounded-full h-40 w-40"
                />
                <div className="space-y-2">
                    <div className="font-bold text-3xl">{user.fullname}</div>
                    <div className="text-gray-500">{`@${user.username} • ${user.subscriberCount} subscribers • ${videos.length} videos`}</div>
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
