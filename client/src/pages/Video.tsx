import { Button } from "@/components/ui/button";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/provider";
import { IVideoData } from "@/interfaces";
import { formatDistanceToNow } from "date-fns";
import DefaultProfileImage from "@/assets/images/profile.png";
import videoService from "@/services/video.services";
import subscriptionServices from "@/services/subscription.services";
import likeService from "@/services/like.services";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import SaveToPlaylist from "./SaveToPlaylist";
import Comments from "@/components/root/Comments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";

const Video = () => {
    const { videoId } = useParams();
    const user = useSelector((state: RootState) => state.auth);
    const [playlistIds, setPlaylistIds] = useState<string[]>([]);

    const queryClient = useQueryClient();

    const {
        data: video,
        isLoading: isVideoLoading,
        error: videoError,
    } = useQuery({
        queryKey: ["video", videoId],
        queryFn: () => videoService.getAVideo(videoId),
        enabled: !!videoId,
        select: (res): IVideoData => res.data,
    });

    const { data: isLiked, error: isLikedError } = useQuery({
        queryKey: ["isLiked", videoId],
        queryFn: () => likeService.isLiked(videoId, "video"),
        enabled: !!video && user.status,
        select: (res): boolean => res.data,
    });

    const { data: isSubscribed, error: isSubscribedError } = useQuery({
        queryKey: ["isSubscribed", video?.creator._id],
        queryFn: () => subscriptionServices.isSubscribed(video.creator._id),
        enabled: !!video && user.status,
        select: (res) => res.data.isSubscribed,
    });

    const { data: subscribersCount, error: subscribersCountError } = useQuery({
        queryKey: ["subscribersCount", video?.creator._id],
        queryFn: () =>
            subscriptionServices.getSubscribersCount(video.creator._id),
        enabled: !!video,
        select: (res) => res.data,
    });

    const toggleVideoLikeMutation = useMutation({
        mutationFn: () => likeService.toggleLike(videoId, "video"),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["isLiked", videoId],
            });
        },
    });

    const toggleSubscribeMutation = useMutation({
        mutationFn: () =>
            subscriptionServices.toggleSubscription(video.creator._id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["isSubscribed", video.creator._id],
            });
            queryClient.invalidateQueries({
                queryKey: ["subscribersCount", video.creator._id],
            });
        },
    });

    const addToPlaylistMutation = useMutation({
        mutationFn: (playlistId: string) =>
            playlistServices.addVideoToPlaylist(videoId, playlistId),
        onSuccess: (res) => {
            return res.data;
        },
    });

    const toggleAddPlaylist = () => {
        playlistIds.map((playlistId) =>
            addToPlaylistMutation.mutate(playlistId)
        );
    };

    if (isVideoLoading) return <div>Loading...</div>;
    if (
        videoError ||
        isLikedError ||
        isSubscribedError ||
        subscribersCountError
    )
        return <div>Error loading video</div>;

    return (
        <div className="space-y-4 lg:w-4/5 xl:w-2/3">
            <div className="flex flex-col space-y-2">
                <video
                    autoPlay
                    src={video.videoFile.url}
                    className="w-full rounded-xl"
                    controls
                />
                <h1 className="font-bold text-xl">{video.title}</h1>
                <div className="flex justify-between">
                    <div className="flex gap-x-4 items-center">
                        <Link
                            to={`/${video.creator.username}/channel`}
                            className="flex gap-x-4 items-center"
                        >
                            <img
                                src={
                                    video.creator.avatar?.url ||
                                    DefaultProfileImage
                                }
                                className="rounded-full object-cover h-12 w-12"
                            />
                            <div className="flex flex-col gap-y-1 items-start">
                                <div className="font-bold">
                                    {video.creator.fullname}
                                </div>

                                <div className="text-gray-500  text-sm">
                                    {`${subscribersCount} subscribers`}
                                </div>
                            </div>
                        </Link>

                        <Button
                            disabled={!user.status}
                            variant="default"
                            className={`${
                                !isSubscribed
                                    ? "bg-zinc-300 hover:bg-zinc-400"
                                    : "bg-gray-500 hover:bg-gray-600"
                            } shadow-none text-black rounded-3xl`}
                            onClick={() => toggleSubscribeMutation.mutate()}
                        >
                            {isSubscribed ? "Subscribed" : "Subscribe"}
                        </Button>
                    </div>

                    <div className="flex gap-2 items-center">
                        <Button
                            disabled={!user.status}
                            className={`${isLiked && "text-blue-500"}`}
                            variant="outline"
                            onClick={() => toggleVideoLikeMutation.mutate()}
                        >
                            <BiLike className="text-2xl" />
                        </Button>
                        <Popover
                            onOpenChange={(open) => {
                                if (!open) {
                                    toggleAddPlaylist();
                                }
                            }}
                        >
                            <PopoverTrigger>
                                <Button
                                    disabled={!user.status}
                                    variant="outline"
                                >
                                    <MdOutlinePlaylistAdd className="text-2xl" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 right-0 top-2 absolute bg-gray-400">
                                <SaveToPlaylist
                                    userId={user.userData._id}
                                    setPLaylistIds={setPlaylistIds}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="p-4 shadow-md rounded-xl bg-gray-300 font-semibold">
                    <div className="flex space-x-4">
                        <div>{`${video.views} views`}</div>
                        <div>
                            {formatDistanceToNow(new Date(video.createdAt), {
                                addSuffix: true,
                            })}
                        </div>
                    </div>
                    <div>{video.description}</div>
                </div>
            </div>
            <Comments videoId={videoId} />
        </div>
    );
};

export default Video;
