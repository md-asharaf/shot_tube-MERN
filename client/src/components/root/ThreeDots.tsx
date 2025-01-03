import { Check, Clock4, EllipsisVertical, Share2, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import SaveToPlaylist from "./SaveToPlaylist";
import { useMutation, useQuery } from "@tanstack/react-query";
import userServices from "@/services/User";
import { toast } from "sonner";
import { queryClient } from "../../main";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
interface IThreeDots {
    task?: {
        title: string;
        handler: () => void;
    };
    videoId: string;
}
export default function ThreeDots({ videoId, task = null }: IThreeDots) {
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const { data: isSavedToWatchLater, refetch } = useQuery({
        queryKey: ["is-video-saved", videoId],
        queryFn: async () => {
            const data = await userServices.isSavedToWatchLater(videoId);
            return data.isSaved;
        },
        enabled: !!videoId && !!userId,
    });
    const { mutate: saveToWatchLater } = useMutation({
        mutationFn: async () => {
            await userServices.saveToWatchLater(videoId);
        },
        onSuccess: () => {
            toast.success("Saved to watch later");
            refetch();
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["watch-later", userId],
                exact: true,
            });
        },
    });
    const { mutate: removeFromWatchLater } = useMutation({
        mutationFn: async () => {
            await userServices.removeFromWatchLater(videoId);
        },
        onSuccess: () => {
            toast.success("Removed from watch later");
            refetch();
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["watch-later", userId],
                exact: true,
            });
        },
    });
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <Popover>
                <PopoverTrigger asChild>
                    <EllipsisVertical />
                </PopoverTrigger>
                <PopoverContent
                    collisionPadding={10}
                    className="py-2 px-0 w-full rounded-xl shadow-lg bg-white dark:bg-[#212121] border-none text-sm"
                >
                    <ul className="space-y-2">
                        {task && (
                            <li
                                className="flex items-center space-x-2 cursor-pointer dark:hover:bg-[#535353] hover:bg-[#E5E5E5] py-2 px-4 rounded-md"
                                onClick={task.handler}
                            >
                                <Trash2 className="h-5 w-5" />
                                <span>{task.title}</span>
                            </li>
                        )}
                        <li
                            className="flex items-center space-x-2 cursor-pointer py-2 px-4 dark:hover:bg-[#535353] hover:bg-[#E5E5E5] rounded-md"
                            onClick={() => {
                                if (isSavedToWatchLater) {
                                    removeFromWatchLater();
                                } else {
                                    saveToWatchLater();
                                }
                            }}
                        >
                            {isSavedToWatchLater ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <Clock4 className="h-5 w-5" />
                            )}
                            <span>
                                {isSavedToWatchLater
                                    ? "Saved to Watch Later"
                                    : "Save to Watch Later"}
                            </span>
                        </li>
                        <li className="cursor-pointer dark:hover:bg-[#535353] hover:bg-[#E5E5E5] rounded-md">
                            <SaveToPlaylist
                                videoId={videoId}
                                className="flex items-center space-x-2 py-2 px-4"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 3v16l7-3 7 3V3H5z"
                                    />
                                </svg>
                                <span>Save to playlist</span>
                            </SaveToPlaylist>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer py-2 px-4 dark:hover:bg-[#535353] hover:bg-[#E5E5E5] rounded-md">
                            <Share2 className="w-5 h-5" />
                            <span>Share</span>
                        </li>
                    </ul>
                </PopoverContent>
            </Popover>
        </div>
    );
}
