import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";
import { useSuccess } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { IPlaylist } from "@/interfaces";

const Playlist = () => {
    const dispatch = useDispatch();
    const { playlistId } = useParams();
    const success = useSuccess(dispatch);
    const fetchPlaylist = async () => {
        const res = await playlistServices.getPlaylist(playlistId);
        if (success(res)) {
            return res.data;
        }
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
    if (isLoading) return <div>Loading...</div>;
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
        <div className="text-black flex space-x-1 w-full">
            <div className="w-[300px] bg-gray-200 p-5 space-y-3 rounded-xl overflow-auto">
                <img
                    src={playlist.videos[0].thumbnail.url}
                    alt="Playlist Thumbnail"
                    className="w-full rounded-lg"
                />
                <h1 className="text-[2em] font-bold">{playlist.name}</h1>
                <p>{playlist.creator?.fullname}</p>
                <p className="text-xs">
                    {`${playlist.videos?.length} videos • ${totalViews} views • Last updated on 11 Dec
                        2021`}
                </p>
                <div className="flex justify-between w-full">
                    <button className=" bg-blue-500 py-2 px-4 rounded-full w-[47%]">
                        Play all
                    </button>
                    <button className="bg-blue-500 py-2 px-4 rounded-full w-[47%]">
                        Shuffle
                    </button>
                </div>
                <p className="text-sm">{playlist.description}</p>
            </div>

            <div className="grid grid-rows-7 gap-2 overflow-auto">
                {playlist.videos?.map((video, index) => (
                    <Link to={`/videos/${video._id}`} key={video._id}>
                        <div className="flex space-x-4 items-center p-2 hover:bg-gray-300 rounded-lg">
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
                                    {`${video.creator.fullname} • ${video.views} views • 3 years ago`}
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
