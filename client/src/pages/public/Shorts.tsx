import VideoPlayer from "@/components/VideoPlayer";
import {
    EllipsisVertical,
    MessageSquareText,
    Share2,
    ThumbsUp,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Fullscreen,
    Loader2,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AvatarImg from "@/components/AvatarImg";
import { useMutation, useQuery } from "@tanstack/react-query";
import shortService from "@/services/Short";
import commentService from "@/services/Comment";
import subscriptionService from "@/services/Subscription";
import { IShortData } from "@/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useState, useRef, useEffect } from "react";
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
    const [open,setOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const shortId = searchParams.get("s");
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(100);
    const [isVolumeHovered, setIsVolumeHovered] = useState(false);
    const theme = useSelector((state: RootState) => state.theme.mode);
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const openedCard = useSelector((state: RootState) => state.short.openCard);
    const playerRef = useRef(null);
    //queries
    const { data: short, isLoading } = useQuery({
        queryKey: ["short", shortId],
        queryFn: async (): Promise<IShortData> => {
            const data = await shortService.singleShort(shortId);
            return data.short;
        },
        enabled: !!shortId,
    });
    const { data: isLiked } = useQuery({
        queryKey: ["is-liked", shortId],
        queryFn: async (): Promise<boolean> => {
            const data = await likeService.isLiked(shortId, "short");
            return data.isLiked;
        },
        enabled: !!userId && !!short,
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
    //mutations
    const { mutate: toggleSubscription } = useMutation({
        mutationFn: async () => {
            await subscriptionService.toggleSubscription(short.creator._id);
            refetchIsSubscribed();
        },
    });
    const { mutate: toggleLike } = useMutation({
        mutationFn: async () => {
            await likeService.toggleLike(shortId, "short");
        },
        onMutate: async (variables) => {
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
    const enterFullscreen = () => {
        if (playerRef.current) {
            playerRef.current.fullscreen.enter();
        }
    };
    const togglePlayPause = () => {
        if (playerRef.current) {
            if (playerRef.current.paused) {
                playerRef.current.play();
                setIsPlaying(true);
            } else {
                playerRef.current.pause();
                setIsPlaying(false);
            }
        }
    };
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.muted = isMuted;
            if (!isMuted && volume === 0) {
                setVolume(20);
            }
        }
    }, [isMuted]);
    useEffect(() => {
        if (playerRef.current) {
            if (volume === 0) {
                setIsMuted(true);
            }
            playerRef.current.volume = volume / 100;
        }
    }, [volume]);
    if(isLoading){
        return (
            <div className="flex items-center justify-center h-full w-full">
                <Loader2  className="h-10 w-10 animate-spin"/>
            </div>
        )
    }
    return (
        <div className="flex items-start justify-around">
            <div className="flex space-x-2 items-end ml-40 mx-20">
                <div className="relative w-[512px] rounded-lg shadow-lg group">
                    <div className="relative group">
                        <VideoPlayer
                            key={shortId}
                            minWatchTime={10}
                            source={short.source}
                            playerRef={playerRef}
                            onViewTracked={() => {}}
                            controls={["progress", "fullscreen"]}
                            className="aspect-[9/16]"
                            subtitles={[
                                {
                                    label: "English",
                                    src: short.subtitle,
                                    srclang: "en",
                                    default: true,
                                },
                            ]}
                        />
                        <div className="absolute top-4 justify-between h-11 w-full  px-2 group-hover:flex hidden">
                            <div className="flex space-x-2">
                                <button
                                    className="p-3 hover:bg-opacity-50 bg-opacity-60 bg-[#676D72] text-white rounded-full transition"
                                    onClick={togglePlayPause}
                                >
                                    {isPlaying ? (
                                        <Pause
                                            size={20}
                                            className="text-white"
                                        />
                                    ) : (
                                        <Play
                                            size={20}
                                            className="text-white"
                                        />
                                    )}
                                </button>
                                <button
                                    className="flex space-x-2 p-3 hover:bg-opacity-50 bg-opacity-60 bg-[#676D72] text-white rounded-full transition items-center"
                                    onMouseEnter={() =>
                                        setIsVolumeHovered(true)
                                    }
                                    onMouseLeave={() =>
                                        setIsVolumeHovered(false)
                                    }
                                >
                                    {isMuted ? (
                                        <VolumeX
                                            size={20}
                                            onClick={() => {
                                                setIsMuted(false);
                                            }}
                                        />
                                    ) : (
                                        <Volume2
                                            size={20}
                                            onClick={() => {
                                                setIsMuted(true);
                                            }}
                                        />
                                    )}
                                    {isVolumeHovered && (
                                        <div className="relative flex items-center">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={volume}
                                                onChange={(e) => {
                                                    setIsMuted(false);
                                                    setVolume(
                                                        Number(e.target.value)
                                                    );
                                                }}
                                                className="w-full cursor-pointer h-1 appearance-none"
                                            />
                                            <div
                                                className="absolute -top-1/2 -translate-y-1/2 left-0 w-full h-6 cursor-pointer"
                                                onClick={(e) => {
                                                    const rect =
                                                        e.currentTarget.getBoundingClientRect();
                                                    const clickX =
                                                        e.clientX - rect.left;
                                                    const newValue = Math.round(
                                                        (clickX / rect.width) *
                                                            100
                                                    );
                                                    setVolume(newValue);
                                                }}
                                            />
                                        </div>
                                    )}
                                </button>
                            </div>
                            <button
                                className="p-3 hover:bg-opacity-50 bg-opacity-60 bg-[#676D72] text-white rounded-full transition"
                                onClick={enterFullscreen}
                            >
                                <Fullscreen size={20} />
                            </button>
                        </div>
                        <div className="text-white absolute bottom-10 left-4 space-y-2 text-sm">
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
                    <div className="absolute sm:bottom-0 sm:-right-14 bottom-16 right-0 flex flex-col sm:space-y-4 space-y-2 items-center">
                        <div
                            className="p-3 bg-muted hover:bg-muted/80 rounded-full"
                            onClick={() => toggleLike()}
                        >
                            <ThumbsUp
                                size={20}
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
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger className="p-3 bg-muted hover:bg-muted/80 rounded-full">
                                <EllipsisVertical size={20} />
                            </PopoverTrigger>
                            <PopoverContent
                                className="p-0 py-2 m-0 max-w-[200px]"
                                align="start"
                                onClick={()=>{
                                    setOpen(false)
                                }}
                            >
                                <ShortPopoverContent
                                    shortId={short._id}
                                    playerRef={playerRef}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
            <div className="space-y-2 absolute top-1/2 right-4">
                {short.prev && (
                    <div
                        className="p-4 bg-muted rounded-full"
                        onClick={() =>
                            navigate(`/short?s=${short.prev}`, {
                                replace: true,
                            })
                        }
                    >
                        <ArrowUp size={20} />
                    </div>
                )}
                {short.next && (
                    <div
                        className="p-4 bg-muted rounded-full"
                        onClick={() =>
                            navigate(`/short?s=${short.next}`, {
                                replace: true,
                            })
                        }
                    >
                        <ArrowDown size={20} />{" "}
                    </div>
                )}
            </div>
            <div className="mr-20">{openedCard === "description" && (
                <DescriptionCard short={short} likes={likesCount} />
            )}
            {openedCard === "comments" && (
                <CommentsCard
                    shortId={short._id}
                    playerRef={playerRef}
                    creatorId={short.creator._id}
                />
            )}</div>
        </div>
    );
};

export default Shorts;
