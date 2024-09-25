import { IVideoData } from "@/interfaces";
import videoServices from "@/services/video.services";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useQuerry } from "@/provider/video.slice";
import { Loader2 } from "lucide-react";
const SearchedVideos = () => {
    const { query } = useQuerry();
    const { data: videos, isLoading } = useQuery<IVideoData[]>({
        queryKey: ["searched-videos", query],
        queryFn: async () => {
            const res = await videoServices.searchVideos(query);
            return res.data;
        },
        enabled: !!query,
    });
    if (isLoading) {
        return (
            <div className="flex w-[90%] justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    if (!videos || videos.length === 0)
        return (
            <div className="flex items-center text-2xl justify-center mt-40 w-[80%] dark:text-white">
                {videos ? `No results for "${query}"` : "Go to home page"}
            </div>
        );

    return (
        <div className="lg:pl-40 dark:text-white text-black">
            {videos?.map((video) => (
                <Link to={`/videos/${video._id}`} key={video._id}>
                    <div className="flex space-x-2 p-2 rounded-lg h-1/4">
                        <div className="relative mr-5 w-1/2 xl:w-1/3">
                            <img
                                src={video.thumbnail}
                                alt="Video Thumbnail"
                                className="w-full rounded-lg aspect-video object-cover "
                            />
                            <span className="absolute bottom-2 bg-black right-2 bg-opacity-75 text-white px-2 text-xs">
                                {video.duration}
                            </span>
                        </div>
                        <div className="w-1/2 xl:w-2/3 flex flex-col space-y-4">
                            <div>
                                <div className="text-xl">{video.title}</div>
                                <div className="text-gray-400">
                                    {`${
                                        video.views
                                    } views • ${formatDistanceToNow(
                                        new Date(video.createdAt)
                                    ).replace("about", "")} ago`}
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <img
                                    src={video.creator.avatar}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>{video.creator.fullname}</div>
                            </div>
                            <div className="text-gray-400">
                                {video.description}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default SearchedVideos;
