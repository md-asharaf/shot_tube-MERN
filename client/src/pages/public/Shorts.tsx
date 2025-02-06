import VideoPlayer from "@/components/VideoPlayer";
import {
    EllipsisVertical,
    MessageSquareText,
    Share2,
    ThumbsDown,
    ThumbsUp,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Fullscreen,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import AvatarImg from "@/components/AvatarImg";
import { useMutation, useQuery } from "@tanstack/react-query";
import shortService from "@/services/Short";
import commentService from "@/services/Comment";
import subscriptionService from "@/services/Subscription";
import { IShortData } from "@/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useState, useRef } from "react";
import likeService from "@/services/Like";
import { setShareModal } from "@/store/reducers/ui";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import ShortPopoverContent from "@/components/ShortPopoverContent";
import DescriptionCard from "@/components/DescriptionCard";
import CommentsCard from "@/components/CommentsCard";
import { setOpenCard } from "@/store/reducers/short";
import { queryClient } from "@/main";
const Shorts = () => {
    const [searchParams] = useSearchParams();
    const shortId = searchParams.get("s");
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const videoRef = useRef(null);
    const openedCard = useSelector((state: RootState) => state.short.openCard);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    const { data: short, isLoading } = useQuery({
        queryKey: ["short", shortId],
        queryFn: async (): Promise<IShortData> => {
            const data = await shortService.singleShort(shortId);
            return data.short;
        },
        enabled: !!shortId,
    });

    const { data: isSubscribed, refetch: refetchIsSubscribed } = useQuery({
        queryKey: ["subscribe", short?.creator?._id],
        queryFn: async (): Promise<boolean> => {
            const data = await subscriptionService.isChannelSubscribed(
                short.creator._id
            );
            return data.isSubscribed;
        },
        enabled: !!userId && !!short,
    });

    const { mutate: toggleSubscription } = useMutation({
        mutationFn: async () => {
            await subscriptionService.toggleSubscription(short.creator._id);
            refetchIsSubscribed();
        },
    });
    const { data: isLiked } = useQuery({
        queryKey: ["is-liked", shortId],
        queryFn: async (): Promise<boolean> => {
            const data = await likeService.isLiked(shortId, "short");
            return data.isLiked;
        },
    });
    const { data: likesCount } = useQuery({
        queryKey: ["likes-count", shortId],
        queryFn: async (): Promise<number> => {
            const data = await likeService.likesCount(shortId, "short");
            return data.likesCount;
        },
        enabled: !!short,
    });
    const { data: commentsCount } = useQuery({
        queryKey: ["comments-count", shortId],
        queryFn: async (): Promise<number> => {
            const data = await commentService.commentsCount(shortId, "short");
            return data.commentsCount;
        },
        enabled: !!short,
    });
    const { mutate: toggleLike } = useMutation({
        mutationFn: async () => {
            await likeService.toggleLike(shortId, "short");
        },
        async onMutate(variables) {
            await queryClient.cancelQueries({
                queryKey: ["likes-count", shortId],
            });
            await queryClient.cancelQueries({
                queryKey: ["is-liked", shortId],
            });
            const prevLikes = queryClient.getQueryData<number>([
                "likes-count",
                shortId,
            ]);
            const prevLikeStatus = queryClient.getQueryData<boolean>([
                "is-liked",
                shortId,
            ]);
            await queryClient.setQueryData(
                ["likes-count", shortId],
                (prevLikes || 0) + (prevLikeStatus ? -1 : 1)
            );
            await queryClient.setQueryData(
                ["is-liked", shortId],
                !prevLikeStatus
            );
        },
    });
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };
    const toggleFullscreen = () => {
        if (videoRef.current) {
            videoRef.current.fullscreen.toggle();
        }
    };
    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };
    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="flex items-end justify-center space-x-2">
            <div className="relative w-full max-w-lg rounded-lg overflow-hidden shadow-lg group">
                <div className="relative w-full group">
                    <VideoPlayer
                        minWatchTime={10}
                        source={short.source}
                        playerRef={videoRef}
                        onViewTracked={() => {}}
                        controls={["progress"]}
                        className="aspect-[9/16]"
                    />
                    <div className="absolute top-4 justify-between w-full px-2 group-hover:flex hidden">
                        <div className="space-x-2">
                            <button
                                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition"
                                onClick={togglePlayPause}
                            >
                                {isPlaying ? (
                                    <Pause size={20} className="text-white" />
                                ) : (
                                    <Play size={20} className="text-white" />
                                )}
                            </button>
                            <button
                                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition"
                                onClick={toggleMute}
                            >
                                {isMuted ? (
                                    <VolumeX size={20} />
                                ) : (
                                    <Volume2 size={20} />
                                )}
                            </button>
                        </div>
                        <button
                            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition"
                            onClick={toggleFullscreen}
                        >
                            <Fullscreen size={20} />
                        </button>
                    </div>
                </div>

                <div className="text-white absolute bottom-12 left-4 space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                        <Link
                            to={`/channel?u=${short.creator.username}`}
                            className="flex items-center space-x-2"
                        >
                            <div className="h-9 w-9">
                                <AvatarImg
                                    fullname={short.creator.fullname}
                                    avatar={short.creator.avatar}
                                />
                            </div>
                            <div className="font-bold">{`@${short.creator.username}`}</div>
                        </Link>

                        <button
                            className="rounded-full font-semibold bg-white text-black px-2 py-1"
                            onClick={() => toggleSubscription()}
                        >
                            {isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>
                    <div className="font-semibold">{short.title}</div>
                </div>
            </div>
            <div className="flex flex-col space-y-4 items-center">
                <div
                    className="p-3 bg-muted hover:bg-muted/80 rounded-full"
                    onClick={() => toggleLike()}
                >
                    <ThumbsUp size={20} />
                </div>
                {likesCount}
                <div
                    className="p-3 bg-muted hover:bg-muted/80 rounded-full "
                    onClick={() => dispatch(setOpenCard("comments"))}
                >
                    <MessageSquareText size={20} />
                </div>
                {commentsCount}
                <div
                    className="p-3 bg-muted hover:bg-muted/80 rounded-full"
                    onClick={() =>
                        dispatch(
                            setShareModal({
                                open: true,
                                shareData: {
                                    id: shortId,
                                    type: "short",
                                },
                            })
                        )
                    }
                >
                    <Share2 size={20} />
                </div>
                <Popover>
                    <PopoverTrigger className="p-3 bg-muted hover:bg-muted/80 rounded-full">
                        <EllipsisVertical size={20} />
                    </PopoverTrigger>
                    <PopoverContent
                        className="p-0 py-2 m-0 max-w-[200px]"
                        align="start"
                    >
                        <ShortPopoverContent shortId={short._id} />
                    </PopoverContent>
                </Popover>
            </div>
            {openedCard === "description" && <DescriptionCard short={short} likes={likesCount}/>}
            {openedCard === "comments" && <CommentsCard shortId={short._id} />}
        </div>
    );
};

export default Shorts;
