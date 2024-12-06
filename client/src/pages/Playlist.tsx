import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";
import { IPlaylist } from "@/interfaces";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";

const Playlist = () => {
    const { playlistId } = useParams();
    const fetchPlaylist = async () => {
        const res = await playlistServices.getPlaylist(playlistId);
        return res.data;
    };
    const {
        data: playlist,
        isError,
        isLoading,
        error,
    } = useQuery<IPlaylist>({
        queryKey: ["playlist", playlistId],
        queryFn: fetchPlaylist,
        enabled: !!playlistId,
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
    if (playlist.videos.length === 0)
        return <div>No videos in this playlist</div>;
    const totalViews = playlist.videos.reduce(
        (prev, curr) => prev + curr.views,
        0
    );
    return (
        <div className="flex flex-col gap-4 lg:flex-row h-full  w-full dark:text-white">
            {/* Left Section: Playlist Info */}
            <div className="flex flex-col space-y-4 sm:space-x-4 sm:flex-row lg:flex-col dark:bg-zinc-700 bg-gray-200 p-5  rounded-xl lg:h-full lg:w-1/3">
                {/* Playlist Thumbnail */}
                <img
                    src={playlist.videos[0].thumbnail}
                    alt="Playlist Thumbnail"
                    className="object-cover aspect-video sm:w-1/2 lg:w-full rounded-lg hover:opacity-50"
                    loading="lazy"
                />

                <div className="space-y-3">
                    {/* Playlist Details */}
                    <h1 className="text-2xl font-bold truncate">
                        {playlist.name}
                    </h1>
                    <p className="text-gray-500 text-sm truncate">
                        {playlist.creator?.fullname}
                    </p>
                    <p className="text-xs text-gray-400">
                        {`${playlist.videos?.length} videos • ${totalViews} views • Last updated on ${playlist.updatedAt.toDateString()}`}
                    </p>

                    {/* Buttons */}
                    <div className="flex justify-between gap-2 w-full">
                        <Button className="bg-white text-black hover:bg-black hover:text-white transition-colors py-2 px-4 rounded-full w-1/2">
                            Play all
                        </Button>
                        <Button className="bg-white text-black hover:bg-black hover:text-white transition-colors py-2 px-4 rounded-full w-1/2">
                            Shuffle
                        </Button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500">
                        {playlist.description}
                    </p>
                </div>
            </div>

            {/* Right Section: Video List */}
            <div className="flex flex-col w-full lg:w-2/3">
                {playlist.videos?.map((video, index) => (
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

export default Playlist;
