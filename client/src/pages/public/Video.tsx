import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IVideoData } from "@/interfaces";
import { formatDistanceToNowStrict } from "date-fns";
import DefaultProfileImage from "@/assets/images/profile.png";
import videoService from "@/services/Video";
import subscriptionServices from "@/services/Subscription";
import likeService from "@/services/Like";
import SaveToPlaylist from "@/components/popups/SaveToPlaylist";
import Comments from "@/components/Comments";
import { useQuery, useMutation } from "@tanstack/react-query";
import videoServices from "@/services/Video";
import VideoPlayer from "@/components/VideoPlayer";
import { Bookmark, ThumbsUp } from "lucide-react";
import userServices from "@/services/User";
import ThreeDots from "@/components/ThreeDots";
import { formatViews } from "@/lib/utils";
import { useWindowSize } from "@/hooks/use-window";
import { RootState } from "@/store/store";
import { toggleMenu } from "@/store/reducers/ui";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
const Video = () => {
    const dispatch = useDispatch();
    const playerRef = useRef(null);
    const [searchParams] = useSearchParams();
    const videoId = searchParams.get("v");
    const [isExpanded, setIsExpanded] = useState(false);
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const { isMobile } = useWindowSize();
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
            NProgress.start();
            const data = await videoService.singleVideo(videoId);
            NProgress.done();
            return data.video;
        },
        enabled: !!videoId,
    });

    const { data: isLiked, refetch: refetchIsLiked } = useQuery({
        queryKey: ["isLiked", videoId],
        queryFn: async (): Promise<boolean> => {
            const data = await likeService.isLiked(videoId, "video");
            return data.isLiked;
        },
        enabled: !!userId && !!videoId,
    });

    const { data: isSubscribed, refetch: refetchIsSubscribed } = useQuery({
        queryKey: ["subscribe", video?.creator?._id, userId],
        queryFn: async (): Promise<boolean> => {
            const data = await subscriptionServices.isChannelSubscribed(
                video.creator._id
            );
            return data.isSubscribed;
        },
        enabled: !!video && !!userId,
    });

    const { data: subscribersCount, refetch: refetchSubscribersCount } =
        useQuery({
            queryKey: ["subscribersCount", video?.creator?._id],
            queryFn: async (): Promise<number> => {
                const data = await subscriptionServices.getSubscribersCount(
                    video.creator._id
                );
                return data.subscribersCount;
            },
            enabled: !!video,
        });

    const { data: recommendedVideos } = useQuery({
        queryKey: ["recommendedVideos", videoId],
        queryFn: async (): Promise<IVideoData[]> => {
            const data = await videoService.recommendedVideos(videoId, userId);
            return data.recommendations;
        },
        enabled: !!videoId,
    });

    const { mutate: incrementViews } = useMutation({
        mutationFn: async ({ videoId }: { videoId: string }) =>
            await videoServices.incrementViews(videoId),
    });

    const { mutate: toggleVideoLike } = useMutation({
        mutationFn: async () => {
            await likeService.toggleLike(videoId, "video");
            refetchIsLiked();
        },
    });

    const { mutate: toggleSubscription } = useMutation({
        mutationFn: async () => {
            await subscriptionServices.toggleSubscription(video.creator._id);
            refetchIsSubscribed();
            refetchSubscribersCount();
        },
    });

    const { mutate: addToWatchHistory } = useMutation({
        mutationFn: async ({ videoId }: { videoId: string }) => {
            await userServices.addVideoToWatchHistory(videoId);
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
    if (isError) return <div>Error: {error?.message}</div>;
    if(isLoading) return null
    return (
        <div className="flex flex-col space-y-4 xl:flex-row w-full">
            <div className="space-y-4 w-full xl:w-2/3 2xl:w-[70%]">
                <div className="flex flex-col space-y-2 px-2">
                    <VideoPlayer
                        source={video.video}
                        subtitles={[
                            {
                                kind: "subtitles",
                                label: "English",
                                srclang: "en",
                                src: video.subtitle,
                            },
                        ]}
                        playerRef={playerRef}
                        onViewTracked={onViewTracked}
                        minWatchTime={
                            parseInt(video.duration) < 30
                                ? parseInt(video.duration)
                                : 30
                        }
                        className="w-full h-full object-cover aspect-video rounded-xl"
                    />
                    <h1 className="font-bold text-xl">{video.title}</h1>
                    <div className="flex justify-between flex-col sm:flex-row gap-y-2 sm:gap-0">
                        <div className="flex gap-x-4 items-center justify-between sm:justify-normal">
                            <Link
                                to={`/channel?u=${video.creator.username}`}
                                className="flex gap-x-4 items-center"
                            >
                                <img
                                    src={
                                        video.creator.avatar ||
                                        DefaultProfileImage
                                    }
                                    className="rounded-full object-cover h-12 w-12"
                                    loading="lazy"
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
                                    <ThumbsUp fill={isLiked?"black":"white"}/> 2.2k
                                </Button>
                                <SaveToPlaylist videoId={videoId}>
                                    <Button
                                        variant="secondary"
                                        className="rounded-full"
                                    >
                                        <Bookmark /> Save
                                    </Button>
                                </SaveToPlaylist>
                            </div>
                        )}
                        {isMobile && (
                            <div className="w-full p-2 shadow-md rounded-xl bg-zinc-200 dark:bg-[#272727]">
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
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            className={`${
                                                isLiked &&
                                                "text-blue-500 hover:text-blue-500"
                                            } dark:bg-zinc-600 border-none bg-zinc-200 h-7 sm:h-9`}
                                            variant="outline"
                                            onClick={() => toggleVideoLike()}
                                        >
                                            <ThumbsUp
                                                height={100}
                                                width={100}
                                            />
                                        </Button>
                                        <Button
                                            disabled={!userId}
                                            className="dark:bg-zinc-600 border-none bg-zinc-200 h-7 sm:h-9 px-3 rounded-md"
                                            variant="outline"
                                        >
                                            <SaveToPlaylist videoId={videoId}>
                                                <Bookmark />
                                            </SaveToPlaylist>
                                        </Button>
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
                    <Comments videoId={videoId} playerRef={playerRef} />
                </div>
            </div>
            <div className="w-full xl:w-1/3 2xl:w-[30%]">
                {recommendedVideos?.map((video) => (
                    <Link
                        to={`/video?v=${video._id}`}
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
                <Comments videoId={videoId} playerRef={playerRef} />
            </div>
        </div>
    );
};

export default Video;
