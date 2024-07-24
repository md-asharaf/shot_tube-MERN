import { IVideoData } from "@/interfaces";
import { useSuccess } from "@/lib/utils";
import { RootState } from "@/provider";
import videoServices from "@/services/video.services";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const LikedVideos = () => {
    const dispatch = useDispatch();
    const successfull = useSuccess(dispatch);
    const userData = useSelector((state: RootState) => state.auth.userData);
    const fetchLikedVideos = async () => {
        const res = await videoServices.likedVideos();
        if (successfull(res)) {
            return res.data;
        }
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
        return <div>Loading...</div>;
    }
    if (isError) {
        return <div>ERROR: {error.message}</div>;
    }
    if (videos.length === 0) return <div>No liked videos...</div>;
    const totalViews = videos.reduce((prev, curr) => prev + curr.views, 0);
    console.log(videos);
    return (
        <div className="px-1 text-black flex-col flex md:flex-row gap-4 md:gap-1 relative w-full">
            <div className="bg-gray-200 p-5 space-y-3 rounded-xl overflow-auto max-w-lg">
                <img
                    src={videos[0].thumbnail.url}
                    alt="Playlist Thumbnail"
                    className="rounded-lg"
                />
                <h1 className="text-[2em] font-bold">Liked Videos</h1>
                <p>{userData.fullname}</p>
                <p className="text-xs">
                    {`${videos.length} videos • ${totalViews} views • Last updated on 11 Dec
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
            </div>

            <div className="flex flex-col gap-2 min-w-[410px]">
                {videos.map((video, index) => (
                    <Link to={`/videos/${video._id}`} key={video._id}>
                        <div className="flex space-x-2 items-center p-2 hover:bg-gray-300 rounded-lg">
                            <div>{index + 1}</div>
                            <div className="relative w-40 mr-5">
                                <img
                                    src={video.thumbnail.url}
                                    alt="Video Thumbnail"
                                    className="w-full h-[10vh] rounded-lg"
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

export default LikedVideos;
