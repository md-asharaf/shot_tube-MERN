import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { IShortData, IVideoData } from "@/interfaces";
import { userService } from "@/services/User";
import { Button } from "@/components/ui/button";
import { MdDelete } from "react-icons/md";
import { Loader2 } from "lucide-react";
import { formatDuration, formatViews } from "@/lib/utils";
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
import { ThreeDots } from "@/components/root/three-dots";
import { toast } from "sonner";
import { RootState } from "@/store/store";
import { AlertDialogDescription } from "@/components/ui/alert-dialog";

export const WatchHistory = () => {
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const {
        data: watchHistory,
        isError,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["watch-history", userId],
        queryFn: async (): Promise<{
            shorts: IShortData[];
            videos: IVideoData[];
        }> => {
            const data = await userService.getWatchHistory();
            return data.watchHistory;
        },
        enabled: !!userId,
    });
    const videos = watchHistory?.videos;
    const shorts = watchHistory?.shorts;
    const { mutate: clearAllHistory } = useMutation({
        mutationFn: async () => {
            await userService.clearWatchHistory();
        },
        onSuccess: () => {
            refetch();
            toast.success("Cleared all history");
            return true;
        },
    });
    const { mutate: remove } = useMutation({
        mutationFn: async ({ videoId }: { videoId: string }) => {
            await userService.removeFromWatchHistory(videoId, "video");
        },
        onSuccess: () => {
            refetch();
            toast.success("Removed from history");
            return true;
        },
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
        <div className="w-full">
            <div className="flex justify-between items-center px-2 sm:px-4 mb-2">
                <div className="text-2xl sm:text-3xl">
                    {videos?.length > 0 ? "Watch History" : "No History"}
                </div>

                <AlertDialog>
                    <AlertDialogTrigger disabled={videos?.length === 0}>
                        <div className="flex justify-center items-center h-10">
                            <span className="text-muted-foreground">
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
                    <AlertDialogContent className="max-w-[90%] rounded-lg sm:max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-red-500 text-sm te">
                                This will permanently delete all your watch
                                history.
                            </AlertDialogDescription>
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
                            to={`/video?v=${video._id}`}
                            className="w-full sm:w-3/4 flex flex-col gap-4 p-2 sm:flex-row rounded-lg overflow-hidden"
                        >
                            <div className="relative w-64 min-w-64">
                                <img
                                    src={video.thumbnail}
                                    className="h-full w-full object-cover aspect-video rounded-lg"
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
                                    {`${video.creator.fullname} • ${formatViews(
                                        video.views
                                    )}`}
                                </p>
                            </div>
                        </Link>
                        <div className="mr-8 md:mr-16 lg:mr-32 mt-4">
                            <ThreeDots
                                videoId={video._id}
                                task={{
                                    title: "Remove from Watch history",
                                    handler: () =>
                                        remove({ videoId: video._id }),
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
