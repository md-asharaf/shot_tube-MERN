import { IVideoData } from "@/interfaces";
import videoServices from "@/services/video.services";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Link } from "react-router-dom";
import { useQuerry } from "@/provider/video.slice";
import { Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import DefaultAvatarImage from "@/assets/images/profile.png";
const SearchedVideos = () => {
    const { query } = useQuerry();
    const { data: videos, isLoading } = useQuery({
        queryKey: ["searched-videos", query],
        queryFn: async (): Promise<IVideoData[]> => {
            const data = await videoServices.searchVideos(query);
            return data.videos;
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
        <div className="flex flex-col gap-y-4 px-4 md:px-12 lg:px-40 dark:text-gray-100 text-gray-900 min-h-screen">
            {videos?.map((video) => (
                <Link to={`/videos/${video._id}`} key={video._id}>
                    <div className="flex gap-x-4 rounded-lg">
                        <div className="relative flex-shrink-0 w-1/2 lg:w-2/5 xl:w-1/3 aspect-video">
                            <img
                                src={video.thumbnail}
                                className="w-full h-full rounded-lg object-cover"
                                loading="lazy"
                            />
                            <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                                {formatDuration(video.duration)}
                            </span>
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-lg lg:text-xl font-semibold truncate">
                                    {video.title}
                                </h2>
                                <p className="text-sm lg:text-base text-gray-500">
                                    {`${
                                        video.views
                                    } views • ${formatDistanceToNowStrict(
                                        new Date(video.createdAt)
                                    ).replace("about", "")} ago`}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <img
                                    src={
                                        video.creator.avatar ||
                                        DefaultAvatarImage
                                    }
                                    className="w-10 h-10 rounded-full object-cover"
                                    loading="lazy"
                                />
                                <p className="text-sm lg:text-base font-medium">
                                    {video.creator.fullname}
                                </p>
                            </div>
                            <p className="text-sm lg:text-base text-gray-500 mt-4 line-clamp-3">
                                {video.description}
                            </p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default SearchedVideos;
