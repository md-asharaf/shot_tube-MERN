import { Button } from "@/components/ui/button";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/provider";
import { IVideoData } from "@/interfaces";
import { formatDistanceToNow, set } from "date-fns";
import DefaultProfileImage from "@/assets/images/profile.png";
import videoService from "@/services/video.services";
import subscriptionServices from "@/services/subscription.services";
import likeService from "@/services/like.services";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import SaveToPlaylist from "../components/root/SaveToPlaylist";
import Comments from "@/components/root/Comments";
import { useQuery, useMutation } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";
import userServices from "@/services/user.services";
import videoServices from "@/services/video.services";
import VideoPlayer from "@/components/root/VideoPlayer";
import { Loader2 } from "lucide-react";

const Video = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [maxLength, setMaxLength] = useState(100); // Number of characters before truncating

    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const { videoId } = useParams();
    const [playlistIds, setPlaylistIds] = useState<string[]>([]);
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };
    const fetchVideo = async () => {
        const res = await videoService.singleVideo(videoId);
        return res.data;
    };
    const fetchIsLiked = async () => {
        const res = await likeService.isLiked(videoId, "video");
        return res.data;
    };
    const fetchIsSubscribed = async () => {
        const res = await subscriptionServices.isSubscribed(video.creator._id);
        return res.data.isSubscribed;
    };
    const fetchSubscribersCount = async () => {
        const res = await subscriptionServices.getSubscribersCount(
            video.creator._id
        );
        return res.data;
    };
    const toggleVideoLikeMutation = async () => {
        await likeService.toggleLike(videoId, "video");
        refetchIsLiked();
    };
    const toggleSubscribeMutation = async () => {
        await subscriptionServices.toggleSubscription(video.creator._id);
        refetchIsSubscribed();
        refetchSubscribersCount();
    };
    const addVideoToPlaylist = async (playlistId: string) => {
        const res = await playlistServices.addVideoToPlaylist(
            videoId,
            playlistId
        );
        return res.data;
    };
    const addToWatchHistoryMutation = async () => {
        await userServices.addToWatchHistory(videoId);
    };
    const addToPlaylists = async () => {
        await Promise.all(
            playlistIds.map((playlistId) => {
                add(playlistId);
            })
        );
    };
    const increaseViews = async () =>
        await videoServices.incrementViews(videoId);
    const { mutate: incrementViews } = useMutation({
        mutationFn: increaseViews,
    });
    const { mutate: add } = useMutation({
        mutationFn: addVideoToPlaylist,
        mutationKey: ["add-to-playlist", videoId],
    });

    const {
        data: video,
        isLoading,
        isError,
        error,
    } = useQuery<IVideoData>({
        queryKey: ["video", videoId],
        queryFn: fetchVideo,
        enabled: !!videoId,
    });

    const { data: isLiked, refetch: refetchIsLiked } = useQuery<boolean>({
        queryKey: ["isLiked", videoId],
        queryFn: fetchIsLiked,
        enabled: !!videoId && !!userId,
    });

    const { data: isSubscribed, refetch: refetchIsSubscribed } =
        useQuery<boolean>({
            queryKey: ["subscribe", video?.creator._id, userId],
            queryFn: fetchIsSubscribed,
            enabled: !!video && !!userId,
        });

    const { data: subscribersCount, refetch: refetchSubscribersCount } =
        useQuery<number>({
            queryKey: ["subscribersCount", video?.creator._id],
            queryFn: fetchSubscribersCount,
            enabled: !!video,
        });

    const { data: recommendedVideos } = useQuery<IVideoData[]>({
        queryKey: ["recommendedVideos", videoId],
        queryFn: async () => {
            const res = await videoService.recommendedVideos();
            return res.data;
        },
        enabled: !!videoId,
    });

    const { mutate: toggleVideoLike } = useMutation({
        mutationFn: toggleVideoLikeMutation,
        mutationKey: ["toggleLike", videoId, userId],
    });

    const { mutate: toggleSubscription } = useMutation({
        mutationFn: toggleSubscribeMutation,
        mutationKey: ["subscribe", video?.creator._id, userId],
    });

    const { mutate: addToWatchHistory } = useMutation({
        mutationKey: ["watch-history", videoId, userId],
        mutationFn: addToWatchHistoryMutation,
    });

    useEffect(() => {
        if (video)
            setTimeout(() => {
                addToWatchHistory();
                incrementViews();
            }, 10000);
    }, [video]);

    useEffect(() => {
        setMaxLength(window.innerWidth * 0.1);
    }, [window.innerWidth]);
    if (isLoading) {
        return (
            <div className="flex w-[90%] justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    if (isError) return <div>Error: {error.message}</div>;
    return (
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 w-full dark:text-white">
            <div className="space-y-4 lg:w-4/5 xl:w-2/3">
                <div className="flex flex-col space-y-2 px-2">
                    <VideoPlayer
                        src={video.video}
                        className="w-full h-full rounded-xl"
                    />
                    <h1 className="font-bold text-xl">{video.title}</h1>
                    <div className="flex justify-between flex-col sm:flex-row gap-y-2 sm:gap-0">
                        <div className="flex gap-x-4 items-center justify-between sm:justify-normal">
                            <Link
                                to={`/${video.creator.username}/channel`}
                                className="flex gap-x-4 items-center"
                            >
                                <img
                                    src={
                                        video.creator.avatar ||
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
                                disabled={!userId}
                                variant="default"
                                className={`${
                                    !isSubscribed
                                        ? "bg-zinc-200 hover:bg-zinc-400"
                                        : "bg-zinc-400 hover:bg-zinc-500"
                                } shadow-none text-black rounded-3xl`}
                                onClick={() => toggleSubscription()}
                            >
                                {isSubscribed ? "Subscribed" : "Subscribe"}
                            </Button>
                        </div>

                        <div className="flex sm:items-center justify-end gap-4 sm:gap-2">
                            <Button
                                disabled={!userId}
                                className={`${
                                    isLiked && "text-blue-500"
                                } dark:bg-zinc-600 border-none bg-zinc-200 h-7 sm:h-9`}
                                variant="outline"
                                onClick={() => toggleVideoLike()}
                            >
                                <BiLike className="text-2xl" />
                            </Button>
                            <Popover
                                onOpenChange={(open) => {
                                    if (!open) {
                                        addToPlaylists();
                                    }
                                }}
                            >
                                <PopoverTrigger>
                                    <Button
                                        disabled={!userId}
                                        variant="outline"
                                        className="dark:bg-zinc-600 border-none bg-zinc-200 h-7 sm:h-9"
                                    >
                                        <MdOutlinePlaylistAdd className="text-2xl" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 right-0 top-2 absolute bg-zinc-400">
                                    <SaveToPlaylist
                                        userId={userId}
                                        setPLaylistIds={setPlaylistIds}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="p-4 shadow-md rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold">
                        <div className="flex space-x-4">
                            <div>{`${video.views} views`}</div>
                            <div>
                                {formatDistanceToNow(
                                    new Date(video.createdAt),
                                    {
                                        addSuffix: true,
                                    }
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="description">
                                {isExpanded ||
                                video.description.length <= maxLength
                                    ? video.description
                                    : `${video.description.substring(
                                          0,
                                          maxLength
                                      )}...`}
                            </div>
                            {video.description.length > maxLength && (
                                <button
                                    onClick={toggleExpanded}
                                    className="show-more-btn"
                                >
                                    {isExpanded ? "Show less" : "Show more"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <Comments videoId={videoId} />
            </div>
            <div>
                {recommendedVideos?.map((video) => (
                    <Link to={`/videos/${video._id}`} key={video._id}>
                        <div className="flex gap-4 p-4">
                            <img
                                src={video.thumbnail}
                                className="h-28 w-40 object-cover rounded-lg"
                            />
                            <div className="flex flex-col gap-2">
                                <h2 className="font-bold">{video.title}</h2>
                                <div className="text-gray-500">
                                    {video.creator?.fullname}
                                </div>
                                <div className="text-gray-500">
                                    {`${video.views} views`}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Video;