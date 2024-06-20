import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSuccess } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { IVideoData } from "@/interfaces";
import userServices from "@/services/user.services";
import { RootState } from "@/provider";
import { Button } from "@/components/ui/button";
import { MdDelete } from "react-icons/md";

const WatchHistory = () => {
    const dispatch = useDispatch();
    const successfull = useSuccess(dispatch);
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const fetchWatchHistory = async () => {
        const res = await userServices.watchHistory();
        if (successfull(res)) {
            return res.data;
        }
    };
    const clearAllHistoryMutation = async () => {
        const res = await userServices.clearHistory();
        if (successfull(res)) {
            refetch();
        }
    };
    const {
        data: videos,
        isError,
        isLoading,
        error,
        refetch,
    } = useQuery<IVideoData[]>({
        queryKey: ["watch-history", userId],
        queryFn: fetchWatchHistory,
        enabled: !!userId,
    });

    const { mutate: clearAllHistory } = useMutation({
        mutationFn: clearAllHistoryMutation,
    });
    if (isLoading) return <div>Loading...</div>;
    if (isError) {
        return <div>ERROR: {error.message}</div>;
    }
    return (
        <div className="w-full">
            <div className="text-4xl mb-6">
                {videos.length > 0 ? "Watch History" : "No History"}
            </div>
            <div className="flex space-x-4">
                <div className="grid grid-rows-4 gap-2 overflow-auto w-3/4">
                    {videos?.map((video) => (
                        <Link to={`/videos/${video._id}`} key={video._id}>
                            <div className="flex space-x-4 items-center p-2 row-span-1 hover:bg-gray-300 rounded-lg">
                                <div className="relative">
                                    <img
                                        src={video.thumbnail.url}
                                        alt="Video Thumbnail"
                                        className="w-56 h-32 rounded-lg"
                                    />
                                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 text-xs">
                                        {video.duration}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg mb-2">
                                        {video.title}
                                    </h3>
                                    <p className="text-gray-400">
                                        {`${video.creator.fullname} • ${video.views} views • 3 years ago`}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="flex justify-center items-center h-10 w-1/4">
                    <span className="text-gray-500">
                        clear all watch history
                    </span>
                    <Button
                        disabled={videos.length === 0}
                        variant="destructive"
                        className="ml-4"
                        onClick={() => clearAllHistory()}
                    >
                        <MdDelete className="text-2xl" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default WatchHistory;
