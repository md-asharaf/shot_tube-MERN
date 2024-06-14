import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";
import { useSuccess } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { IPlaylist } from "@/interfaces";

const Playlist = () => {
    const dispatch = useDispatch();
    const { playlistId } = useParams();
    const success = useSuccess(dispatch);
    const {
        data: playlist,
        isError,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["playlist", playlistId],
        queryFn: async (): Promise<IPlaylist> => {
            const res = await playlistServices.getPlaylist(playlistId);
            if (success(res)) {
                return res.data;
            }
        },
    });
    if (isLoading) return <div>Loading...</div>;
    if (isError) {
        return <div>ERROR: {error.message}</div>;
    }
    const totalViews = playlist.videos?.reduce(
        (prev, curr) => prev + curr.views,
        0
    );
    return (
        <div className="px-2 text-black flex space-x-1 relative w-full">
            <div className="w-[27.5%] bg-gray-200 p-5 space-y-3 rounded-xl fixed left-48">
                <img
                    src={playlist.videos[0].thumbnail.url}
                    alt="Playlist Thumbnail"
                    className="rounded-lg"
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

            <div className="grid grid-rows-7 gap-4 w-2/3 absolute right-0">
                {playlist.videos?.map((video, index) => (
                    <div
                        key={video._id}
                        className="flex space-x-4 items-center p-2 hover:bg-gray-300 rounded-lg"
                    >
                        <div>{index + 1}</div>
                        <div className="relative w-40 mr-5">
                            <img
                                src={video.thumbnail.url}
                                alt="Video Thumbnail"
                                className="w-full rounded-lg"
                            />
                            <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 text-xs">
                                {video.duration}
                            </span>
                        </div>
                        <div>
                            <h3></h3>
                            <h3 className="text-lg mb-2">{video.title}</h3>
                            <p className="text-gray-400">
                                {`${video.creator.fullname} • ${video.views} views • 3 years ago`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Playlist;
