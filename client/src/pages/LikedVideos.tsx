import { Button } from "@/components/ui/button";
import { IVideoData } from "@/interfaces";
import { RootState } from "@/provider";
import videoServices from "@/services/video.services";
import { useQuery } from "@tanstack/react-query";
import { formatDuration } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Thumbnail from "@/assets/images/defaultThumbnail.jpg";
import { formatDistanceToNow } from "date-fns";

const LikedVideos = () => {
    const userData = useSelector((state: RootState) => state.auth.userData);

    const {
        data: videos,
        isError,
        error,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["liked-videos"],
        queryFn: async ():Promise<IVideoData[]> => {
            const res = await videoServices.likedVideos();
            return res.data;
        },
    });

    if (isLoading || isFetching) {
        return (
            <div className="flex w-[90%] justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (isError) {
        // More detailed error handling
        const errorMessage = error?.message || "Something went wrong.";
        return (
            <div className="flex items-center justify-center h-full text-xl text-red-500">
                <p>ERROR: {errorMessage}</p>
                <Button
                    onClick={() => window.location.reload()}
                    className="ml-4 bg-red-500 text-white"
                >
                    Retry
                </Button>
            </div>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-2xl">
                No liked videos...
            </div>
        );
    }

    const filteredVideos = videos?.filter(
        (video) => video !== null && video !== undefined
    );

    const totalViews = filteredVideos?.reduce(
        (prev, curr) => prev + (curr?.views || 0),
        0
    );

    return (
        <div className="flex flex-col gap-4 lg:flex-row h-full  w-full dark:text-white">
            <div className="flex flex-col space-y-4 sm:space-x-4 sm:flex-row lg:flex-col dark:bg-zinc-700 bg-gray-200 p-5  rounded-xl lg:h-full lg:w-1/3 pointer-events-none">
                <img
                    src={
                        filteredVideos && filteredVideos[0]?.thumbnail
                            ? filteredVideos[0].thumbnail
                            : Thumbnail
                    }
                    alt="Playlist Thumbnail"
                    className="object-cover aspect-video sm:w-1/2 lg:w-full rounded-lg hover:opacity-50"
                    loading="lazy"
                />
                <div className="space-y-3">
                    <h1 className="text-[2em] font-bold">Liked Videos</h1>
                    <p>{userData?.fullname}</p>
                    <p className="text-xs text-gray-400">
                        {`${
                            filteredVideos?.length
                        } videos • ${totalViews} views • Last updated on ${
                            filteredVideos?.length
                                ? new Date(
                                      filteredVideos[
                                          filteredVideos.length - 1
                                      ]?.updatedAt
                                  ).toDateString()
                                : ""
                        }`}
                    </p>
                    <div className="flex justify-between gap-2 w-full">
                        <Button className="bg-white text-black hover:bg-black hover:text-white transition-colors py-2 px-4 rounded-full w-1/2">
                            Play all
                        </Button>
                        <Button className="bg-white text-black hover:bg-black hover:text-white transition-colors py-2 px-4 rounded-full w-1/2">
                            Shuffle
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full lg:w-2/3 overflow-auto">
                {filteredVideos?.map((video, index) => (
                    <Link to={`/videos/${video._id}`} key={video._id}>
                        <div className="flex items-start p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition duration-200 ease-in-out">
                            {/* Video Index */}
                            <div className="text-gray-500 text-xl mr-2 font-semibold">
                                {index + 1}
                            </div>

                            {/* Video Thumbnail */}
                            <div className="relative w-36 h-24 sm:w-44 sm:h-28 flex-shrink-0">
                                <img
                                    src={video.thumbnail}
                                    alt={`Thumbnail of ${video.title}`}
                                    className="h-full w-full object-cover aspect-video rounded-lg"
                                    loading="lazy"
                                />
                                <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 text-xs rounded">
                                    {formatDuration(video.duration)}
                                </span>
                            </div>

                            {/* Video Details */}
                            <div className="flex-1 ml-4">
                                <h3 className="text-lg font-semibold text-black dark:text-white truncate w-full overflow-hidden">
                                    {video.title}
                                </h3>
                                <p className="text-gray-400 text-sm">
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
