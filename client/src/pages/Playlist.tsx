import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";
import { IPlaylist } from "@/interfaces";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
        <div className="px-1 flex-col flex md:flex-row gap-4 md:gap-1 relative w-full dark:text-white">
            <div className="dark:bg-zinc-700 bg-gray-200 p-5 space-y-3 rounded-xl md:max-w-md">
                <img
                    src={playlist.videos[0].thumbnail.url}
                    alt="Playlist Thumbnail"
                    className="object-cover aspect-video w-full rounded-lg"
                />
                <h1 className="text-[2em] font-bold">{playlist.name}</h1>
                <p>{playlist.creator?.fullname}</p>
                <p className="text-xs">
                    {`${playlist.videos?.length} videos • ${totalViews} views • Last updated on 11 Dec
                        2021`}
                </p>
                <div className="flex justify-between w-full">
                    <Button className="bg-white hover:text-white text-black py-2 px-4 rounded-full w-[47%]">
                        Play all
                    </Button>
                    <Button className="bg-white hover:text-white text-black py-2 px-4 rounded-full w-[47%]">
                        Shuffle
                    </Button>
                </div>
                <p className="text-sm">{playlist.description}</p>
            </div>

            <div className="grid grid-rows-6 gap-2 md:min-w-max">
                {playlist.videos?.map((video, index) => (
                    <Link to={`/videos/${video._id}`} key={video._id}>
                        <div className="flex space-x-3 items-center p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg">
                            <div>{index + 1}</div>
                            <div className="relative">
                                <img
                                    src={video.thumbnail.url}
                                    alt="Video Thumbnail"
                                    className="w-40 h-20 rounded-lg"
                                />
                                <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 text-xs">
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

export default Playlist;
