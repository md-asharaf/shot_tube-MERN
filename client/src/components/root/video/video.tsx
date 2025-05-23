import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IVideoData } from "@/interfaces";
import { formatDistanceToNowStrict } from "date-fns";
import { videoService } from "@/services/video";
import { subService } from "@/services/subscription";
import { likeService } from "@/services/like";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { PlyrPlayer } from "@/components/root/video-player";
import { Bookmark, Share2, ThumbsUp } from "lucide-react";
import { userService } from "@/services/user";
import { ThreeDots } from "@/components/root/three-dots";
import { formatViews } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { RootState } from "@/store/store";
import {
    setSaveToPlaylistDialog,
    setShareModalData,
    toggleMenu,
} from "@/store/reducers/ui";
import { AvatarImg } from "@/components/root/avatar-image";
import { VideoComments } from "@/components/root/video/video-comments";
import { queryClient } from "@/main";
import { toast } from "sonner";
export const Video = () => {
    const theme = useSelector((state: RootState) => state.theme.mode);
    const dispatch = useDispatch();
    const playerRef = useRef(null);
    const { id: videoId } = useParams();
    const [isExpanded, setIsExpanded] = useState(false);
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const isMobile = useIsMobile();
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const {
        data: video,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["video", videoId],
        queryFn: async (): Promise<IVideoData> => {
            const data = await videoService.singleVideo(videoId);
            return data.video;
        },
        enabled: !!videoId,
    });

    const { data: isLiked } = useQuery({
        queryKey: ["is-liked", videoId],
        queryFn: async (): Promise<boolean> => {
            const data = await likeService.isLiked(videoId, "video");
            return data.isLiked;
        },
        enabled: !!userId && !!videoId,
    });
    const { data: likesCount } = useQuery({
        queryKey: ["likes-count", videoId],
        queryFn: async (): Promise<number> => {
            const data = await likeService.likesCount(videoId, "video");
            return data.likesCount;
        },
        enabled: !!videoId,
    });
    const { data: isSubscribed } = useQuery({
        queryKey: ["is-subscribed", video?.creator?._id, userId],
        queryFn: async (): Promise<boolean> => {
            const data = await subService.isChannelSubscribed(
                video.creator._id
            );
            return data.isSubscribed;
        },
        enabled: !!video && !!userId,
    });

    const { data: subscribersCount } = useQuery({
        queryKey: ["subscribers-count", video?.creator?._id],
        queryFn: async (): Promise<number> => {
            const data = await subService.getSubscribersCount(
                video.creator._id
            );
            return data.subscribersCount;
        },
        enabled: !!video,
    });

    const { data: videoPages } = useInfiniteQuery({
        queryKey: ["recommended-videos", userId, videoId],
        queryFn: async ({ pageParam = 1 }) => {
            const data = await videoService.recommendedVideos(
                pageParam,
                videoId,
                userId
            );
            return data.recommendations;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length == 12 ? allPages.length + 1 : null,
        enabled: !!videoId,
    });
    const recommendedVideos = videoPages?.pages.flatMap((page) => page);
    const { mutate: incrementViews } = useMutation({
        mutationFn: async ({ videoId }: { videoId: string }) =>
            await videoService.incrementViews(videoId),
    });

    const { mutate: toggleVideoLike } = useMutation({
        mutationFn: async () => {
            await likeService.toggleLike(videoId, "video");
        },
        onMutate: () => {
            queryClient.cancelQueries({ queryKey: ["is-liked", videoId] });
            queryClient.cancelQueries({ queryKey: ["likes-count", videoId] });
            queryClient.setQueryData(
                ["is-liked", videoId],
                (prevData: boolean) => !prevData
            );
            queryClient.setQueryData(
                ["likes-count", videoId],
                (prevData: number) => (isLiked ? prevData - 1 : prevData + 1)
            );
        },
        onError: (error) => {
            queryClient.cancelQueries({ queryKey: ["is-liked", videoId] });
            queryClient.cancelQueries({ queryKey: ["likes-count", videoId] });
            queryClient.setQueryData(
                ["is-liked", videoId],
                (prevData: boolean) => !prevData
            );
            queryClient.setQueryData(
                ["likes-count", videoId],
                (prevData: number) => (isLiked ? prevData - 1 : prevData + 1)
            );
        },
    });

    const { mutate: toggleSubscription } = useMutation({
        mutationFn: async () => {
            await subService.toggleSubscription(video.creator._id);
        },
        onMutate: () => {
            queryClient.cancelQueries({
                queryKey: ["is-subscribed", video?.creator?._id, userId],
            });
            queryClient.cancelQueries({
                queryKey: ["subscribers-count", video?.creator?._id],
            });
            queryClient.setQueryData(
                ["is-subscribed", video?.creator?._id, userId],
                (prevData: boolean) => !prevData
            );
            queryClient.setQueryData(
                ["subscribers-count", video?.creator?._id],
                (prevData: number) =>
                    isSubscribed ? prevData - 1 : prevData + 1
            );
        },
        onError: () => {
            queryClient.cancelQueries({
                queryKey: ["is-subscribed", video?.creator?._id, userId],
            });
            queryClient.cancelQueries({
                queryKey: ["subscribers-count", video?.creator?._id],
            });
            queryClient.setQueryData(
                ["is-subscribed", video?.creator?._id, userId],
                (prevData: boolean) => !prevData
            );
            queryClient.setQueryData(
                ["subscribers-count", video?.creator?._id],
                (prevData: number) =>
                    isSubscribed ? prevData - 1 : prevData + 1
            );
        },
        onSuccess: () => {
            if (isSubscribed) {
                toast.success('Subscription added')
            } else {
                toast.success('Subscription removed')
            }
        }
    });

    const { mutate: addToWatchHistory } = useMutation({
        mutationFn: async ({ videoId }: { videoId: string }) => {
            await userService.addToWatchHistory(videoId, "video");
        },
    });
    const onViewTracked = () => {
        incrementViews({ videoId });
        if (!userId) return;
        addToWatchHistory({ videoId });
    };
    useEffect(() => {
        dispatch(toggleMenu(false));
    }, []);
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.muted = true;
        }
    }, [playerRef]);
    if (isError) return <div>Error: {error?.message}</div>;
    if (isLoading) return null;
    return (
        <div className="flex flex-col space-y-4 xl:flex-row w-full">
            <div className="space-y-4 w-full xl:w-2/3 2xl:w-[70%]">
                <div className="flex flex-col space-y-2 px-2">
                    <PlyrPlayer
                        thumbnail={video.thumbnail}
                        thumbnailPreviews={video.thumbnailPreviews}
                        source={video.source}
                        subtitle={video.subtitle}
                        controls={[
                            "play",
                            "progress",
                            "current-time",
                            "mute",
                            "volume",
                            "settings",
                            "fullscreen",
                        ]}
                        playerRef={playerRef}
                        onViewTracked={onViewTracked}
                        minWatchTime={
                            parseInt(video.duration) < 15
                                ? parseInt(video.duration)
                                : 15
                        }
                        className="aspect-video"
                    />
                    <h1 className="font-bold text-xl">{video.title}</h1>
                    <div className="flex justify-between flex-col sm:flex-row gap-y-2 sm:gap-0">
                        <div className="flex gap-x-4 items-center justify-between sm:justify-normal">
                            <Link
                                to={`/channel/${video.creator.username}`}
                                className="flex gap-x-4 items-center"
                            >
                                <AvatarImg
                                    className="h-12 w-12"
                                    fullname={video.creator.fullname}
                                    avatar={video.creator.avatar}
                                />
                                <div className="flex flex-col gap-y-1 items-start">
                                    <div className="font-bold">
                                        {video.creator.fullname}
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        {`${subscribersCount} subscribers`}
                                    </div>
                                </div>
                            </Link>

                            <Button
                                variant={isSubscribed ? "secondary" : "default"}
                                className="rounded-full"
                                onClick={() => toggleSubscription()}
                            >
                                {isSubscribed ? "Subscribed" : "Subscribe"}
                            </Button>
                        </div>
                        {!isMobile && (
                            <div className="flex sm:items-center justify-end gap-4 sm:gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => toggleVideoLike()}
                                    className="rounded-full"
                                >
                                    <ThumbsUp
                                        fill={
                                            isLiked
                                                ? theme == "dark"
                                                    ? "white"
                                                    : "black"
                                                : theme == "dark"
                                                ? "black"
                                                : "white"
                                        }
                                    />
                                    {likesCount}
                                </Button>
                                <Button
                                    className="rounded-full"
                                    variant="secondary"
                                    onClick={() =>
                                        dispatch(
                                            setShareModalData({
                                                open: true,
                                                id: videoId,
                                                type: "video",
                                            })
                                        )
                                    }
                                >
                                    <Share2 />
                                </Button>
                                <div
                                    onClick={() =>
                                        dispatch(
                                            setSaveToPlaylistDialog({
                                                id: videoId,
                                                open: true,
                                            })
                                        )
                                    }
                                >
                                    <Button
                                        variant="secondary"
                                        className="rounded-full"
                                    >
                                        <Bookmark /> Save
                                    </Button>
                                </div>
                            </div>
                        )}
                        {isMobile && (
                            <div className="w-full p-2 shadow-md rounded-xl bg-[#F2F2F2] dark:bg-[#28292A]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 font-bold">
                                        <div>{formatViews(video.views)}</div>
                                        <div>
                                            {formatDistanceToNowStrict(
                                                new Date(video.createdAt),
                                                { addSuffix: true }
                                            )}
                                        </div>
                                        {!isExpanded && (
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 hover:bg-transparent font-semibold"
                                                onClick={toggleExpanded}
                                            >
                                                ...more
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 items-center">
                                        <Button
                                            variant="ghost"
                                            onClick={() => toggleVideoLike()}
                                            className="rounded-full p-0"
                                        >
                                            <ThumbsUp
                                                fill={
                                                    isLiked
                                                        ? theme == "dark"
                                                            ? "white"
                                                            : "black"
                                                        : theme == "dark"
                                                        ? "black"
                                                        : "white"
                                                }
                                            />
                                            {likesCount}
                                        </Button>
                                        <Button
                                            className="rounded-full"
                                            variant="secondary"
                                            onClick={() =>
                                                dispatch(
                                                    setShareModalData({
                                                        open: true,
                                                        id: videoId,
                                                        type: "video",
                                                    })
                                                )
                                            }
                                        >
                                            <Share2 />
                                        </Button>
                                        <div
                                            onClick={() =>
                                                dispatch(
                                                    setSaveToPlaylistDialog({
                                                        id: videoId,
                                                        open: true,
                                                    })
                                                )
                                            }
                                        >
                                            <Button
                                                variant="ghost"
                                                className="rounded-full p-0"
                                            >
                                                <Bookmark />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div>
                                        <p className="whitespace-pre-wrap">
                                            {video.description}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            onClick={toggleExpanded}
                                            className="h-auto p-0 hover:bg-transparent font-semibold"
                                        >
                                            Show less
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {!isMobile && (
                        <div className="px-4 py-2 shadow-md rounded-xl bg-[#F2F2F2] dark:bg-[#272727]">
                            <div className="flex space-x-2 font-bold">
                                <div>{formatViews(video.views)}</div>
                                <div>
                                    {formatDistanceToNowStrict(
                                        new Date(video.createdAt),
                                        { addSuffix: true }
                                    )}
                                </div>
                            </div>
                            <div>
                                <p
                                    className={`whitespace-pre-wrap ${
                                        !isExpanded ? "line-clamp-2" : ""
                                    }`}
                                >
                                    {video.description}
                                </p>
                                <Button
                                    variant="ghost"
                                    onClick={toggleExpanded}
                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                >
                                    {isExpanded ? "Show less" : "Show more"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="hidden xl:block">
                    <VideoComments
                        creatorId={video.creator._id}
                        videoId={video._id}
                        playerRef={playerRef}
                    />
                </div>
            </div>
            <div className="w-full xl:w-1/3 2xl:w-[30%]">
                {recommendedVideos?.map((video) => (
                    <Link
                        to={`/video/${video._id}`}
                        key={video._id}
                        className="flex justify-between mr-4"
                    >
                        <div className="flex gap-4 px-4 pb-4 lg:min-w-[300px] lg:max-w-[500px]">
                            <img
                                src={video.thumbnail}
                                className="h-24 min-w-44 object-cover rounded-lg aspect-video"
                                loading="lazy"
                            />
                            <div className="flex flex-col overflow-hidden">
                                <p className="font-bold line-clamp-2 overflow-hidden text-ellipsis">
                                    {video.title}
                                </p>
                                <div className="text-muted-foreground text-sm">
                                    {video.creator?.fullname}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {`${formatViews(
                                        video.views
                                    )} • ${formatDistanceToNowStrict(
                                        video.createdAt,
                                        { addSuffix: true }
                                    )}`}
                                </div>
                            </div>
                        </div>
                        <ThreeDots videoId={video._id} />
                    </Link>
                ))}
            </div>
            <div className="xl:hidden">
                <VideoComments
                    videoId={videoId}
                    playerRef={playerRef}
                    creatorId={video.creator._id}
                />
            </div>
        </div>
    );
};

export default Video;
