import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { IVideoData } from "@/interfaces";
import userServices from "@/services/user.services";
import { RootState } from "@/provider";
import { Button } from "@/components/ui/button";
import { MdDelete } from "react-icons/md";
import { Loader2, X } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WatchHistory = () => {
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const fetchWatchHistory = async () => {
        const res = await userServices.watchHistory();
        return res.data;
    };
    const clearAllHistoryMutation = async () => {
        await userServices.clearHistory();
        refetch();
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
    return (
        <div className="w-full dark:text-white">
            <div className="flex justify-between sm:px-4">
                <div className="text-4xl mb-4">
                    {videos?.length > 0 ? "Watch History" : "No History"}
                </div>

                <AlertDialog>
                    <AlertDialogTrigger disabled={videos?.length === 0}>
                        <div className="flex justify-center items-center h-10">
                            <span className="text-gray-500 dark:text-zinc-300">
                                clear history
                            </span>
                            <Button
                                variant="destructive"
                                className="ml-4 mr-2"
                                disabled={videos?.length === 0}
                            >
                                <MdDelete className="text-2xl" />
                            </Button>
                        </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => clearAllHistory()}
                            >
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <hr className="mb-2" />
            <div className="flex flex-col w-full">
                {videos?.map((video) => (
                    <div
                        className="flex items-start justify-between mb-4"
                        key={video._id}
                    >
                        <Link
                            to={`/videos/${video._id}`}
                            className="w-3/4 flex flex-col gap-4 p-2 sm:flex-row hover:bg-zinc-200 hover:dark:bg-zinc-800 rounded-lg"
                        >
                            <div className="relative w-64 min-w-64">
                                <img
                                    src={video.thumbnail}
                                    alt="Video Thumbnail"
                                    className="object-cover aspect-video rounded-lg"
                                    loading="lazy"
                                />
                                <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 text-xs">
                                    {formatDuration(video.duration)}
                                </span>
                            </div>

                            <div className="overflow-hidden">
                                <h3 className="text-lg mb-2 truncate">
                                    {video.title}
                                </h3>
                                <p className="text-gray-400">
                                    {`${video.creator.fullname} • ${video.views} views`}
                                </p>
                            </div>
                        </Link>

                        <X size={50} className="w-28" onClick={()=>{
                            userServices.removeFromWatchHistory(video._id);
                            refetch();
                        }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WatchHistory;
