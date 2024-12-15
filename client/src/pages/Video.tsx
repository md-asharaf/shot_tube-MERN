import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, toggleMenu } from "@/provider";
import { IVideoData } from "@/interfaces";
import { add, formatDistanceToNow } from "date-fns";
import DefaultProfileImage from "@/assets/images/profile.png";
import videoService from "@/services/video.services";
import subscriptionServices from "@/services/subscription.services";
import likeService from "@/services/like.services";
import SaveToPlaylist from "../components/root/SaveToPlaylist";
import Comments from "@/components/root/Comments";
import { useQuery, useMutation } from "@tanstack/react-query";
import videoServices from "@/services/video.services";
import VideoPlayer from "@/components/root/VideoPlayer";
import { Loader2, ThumbsUp } from "lucide-react";
import userServices from "@/services/user.services";

const Video = () => {
    const dispatch = useDispatch();
    const playerRef = useRef(null);
    const { videoId } = useParams();
    const [isExpanded, setIsExpanded] = useState(false);
    const [maxLength, setMaxLength] = useState(100);
    const userId = useSelector((state: RootState) => state.auth.userData?._id);

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
        queryFn: async ():Promise<IVideoData> => {
            const res = await videoService.singleVideo(videoId);
            return res.data;
        },
        enabled: !!videoId,
    });

    const { data: isLiked, refetch: refetchIsLiked } = useQuery({
        queryKey: ["isLiked", videoId],
        queryFn: async ():Promise<boolean> => {
            const res = await likeService.isLiked(videoId, "video");
            return res.data;
        },
        enabled: !!videoId && !!userId,
    });

    const { data: isSubscribed, refetch: refetchIsSubscribed } =
        useQuery({
            queryKey: ["subscribe", video?.creator._id, userId],
            queryFn: async ():Promise<boolean> => {
                const res = await subscriptionServices.isChannelSubscribed(video.creator._id);
                return res.data.isSubscribed;
            },
            enabled: !!video && !!userId,
        });

    const { data: subscribersCount, refetch: refetchSubscribersCount } =
        useQuery({
            queryKey: ["subscribersCount", video?.creator._id],
            queryFn: async ():Promise<number> => {
                const res = await subscriptionServices.getSubscribersCount(
                    video.creator._id
                );
                return res.data;
            },
            enabled: !!video,
        });

    const { data: recommendedVideos } = useQuery({
        queryKey: ["recommendedVideos", videoId],
        queryFn: async ():Promise<IVideoData[]> => {
            const res = await videoService.recommendedVideos(videoId);
            return res.data;
        },
        enabled: !!videoId,
    });

    const { mutate: incrementViews } = useMutation({
        mutationFn: async () =>
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
        mutationFn: async ({videoId}:{videoId:string}) => { 
            await userServices.addVideoToWatchHistory(videoId)
        },
    });
    
    useEffect(() => {
        dispatch(toggleMenu(false));
    }, []);
    useEffect(() => {
        if (video)
            setTimeout(() => {
                incrementViews();
                addToWatchHistory({videoId});
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
        <div className="flex flex-col space-y-4 xl:flex-row w-full dark:text-white">
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
                        className="w-full h-full object-cover aspect-video rounded-xl"
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
                                    loading="lazy"
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
                                        ? "bg-red-400 hover:bg-red-600"
                                        : "bg-gray-200 hover:bg-gray-400"
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
                                    isLiked &&
                                    "text-blue-500 hover:text-blue-500"
                                } dark:bg-zinc-600 border-none bg-zinc-200 h-7 sm:h-9`}
                                variant="outline"
                                onClick={() => toggleVideoLike()}
                            >
                                <ThumbsUp />
                            </Button>
                            <SaveToPlaylist
                                userId={userId}
                                videoId={videoId}
                            />
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
                <Comments videoId={videoId} playerRef={playerRef}/>
            </div>
            <div className="w-full xl:w-1/3 2xl:w-[30%]">
                {recommendedVideos?.map((video) => (
                    <Link to={`/videos/${video._id}`} key={video._id}>
                        <div className="flex gap-4 px-4 pb-4 lg:min-w-[300px] lg:max-w-[500px] ">
                            <img
                                src={video.thumbnail}
                                className="h-24 w-44 object-cover rounded-lg"
                                loading="lazy"
                            />
                            <div className="flex flex-col overflow-hidden">
                                <p className="font-bold line-clamp-2 overflow-hidden text-ellipsis">{video.title}</p>
                                <div className="text-gray-500">
                                    {video.creator?.fullname}
                                </div>
                                <div className="text-gray-500">
                                    {`${video.views} views • ${formatDistanceToNow(video.createdAt, { addSuffix: true })}`}
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
