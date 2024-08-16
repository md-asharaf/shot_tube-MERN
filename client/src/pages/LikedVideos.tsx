import { Button } from "@/components/ui/button";
import { IVideoData } from "@/interfaces";
import { RootState } from "@/provider";
import videoServices from "@/services/video.services";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const LikedVideos = () => {
    const userData = useSelector((state: RootState) => state.auth.userData);
    const fetchLikedVideos = async () => {
        const res = await videoServices.likedVideos();
        return res.data;
    };
    const {
        data: videos,
        isError,
        error,
        isLoading,
    } = useQuery<IVideoData[]>({
        queryKey: ["liked-videos"],
        queryFn: fetchLikedVideos,
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
    if (videos?.length === 0)
        return (
            <div className="flex items-center justify-center h-full text-2xl">
                No liked videos...
            </div>
        );
    const totalViews = videos.reduce((prev, curr) => prev + curr.views, 0);
    return (
        <div className="px-1 flex-col flex md:flex-row gap-4 md:gap-1 relative w-full dark:text-white">
            <div className="dark:bg-zinc-700 bg-gray-200 p-5 space-y-3 rounded-xl md:max-w-md">
                <img
                    src={videos[0].thumbnail.url}
                    alt="Playlist Thumbnail"
                    className="aspect-video object-cover rounded-lg hover:opacity-40"
                />
                <h1 className="text-[2em] font-bold">Liked Videos</h1>
                <p>{userData?.fullname}</p>
                <p className="text-xs">
                    {`${
                        videos.length
                    } videos • ${totalViews} views • Last updated on ${new Date(
                        videos[videos.length - 1].updatedAt
                    ).toDateString()}`}
                </p>
                <div className="flex justify-between w-full">
                    <Button className="bg-white hover:text-white text-black py-2 px-4 rounded-full w-[47%]">
                        Play all
                    </Button>
                    <Button className="bg-white hover:text-white text-black py-2 px-4 rounded-full w-[47%]">
                        Shuffle
                    </Button>
                </div>
            </div>

            <div className="grid grid-rows-6 gap-2 md:min-w-max">
                {videos?.map((video, index) => (
                    <Link to={`/videos/${video._id}`} key={video._id}>
                        <div className="flex space-x-2 items-center p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg">
                            <div>{index + 1}</div>
                            <div className="relative w-40 mr-5">
                                <img
                                    src={video.thumbnail.url}
                                    alt="Video Thumbnail"
                                    className="w-full h-[10vh] rounded-lg"
                                />
                                <span className="absolute bottom-2 bg-black right-2 bg-opacity-75 text-white px-2 text-xs">
                                    {video.duration}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg mb-2">{video.title}</h3>
                                <p className="text-gray-400">
                                    {`${video.creator.fullname} • ${
                                        video.views
                                    } views • ${formatDistanceToNow(
                                        new Date(video.createdAt)
                                    ).replace("about", "")} ago`}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default LikedVideos;
