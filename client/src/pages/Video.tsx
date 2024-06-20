import { Button } from "@/components/ui/button";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import SaveToPlaylist from "../components/root/SaveToPlaylist";
import Comments from "@/components/root/Comments";
import { useQuery, useMutation } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";
import { useSuccess } from "@/lib/utils";
import userServices from "@/services/user.services";
import videoServices from "@/services/video.services";

const Video = () => {
    const dispatch = useDispatch();
    const successfull = useSuccess(dispatch);
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const { videoId } = useParams();
    const [playlistIds, setPlaylistIds] = useState<string[]>([]);
    const fetchVideo = async () => {
        const res = await videoService.singleVideo(videoId);
        return res.data;
    };
    const fetchIsLiked = async () => {
        const res = await likeService.isLiked(videoId, "video");
        if (successfull(res)) {
            return res.data;
        }
    };
    const fetchIsSubscribed = async () => {
        const res = await subscriptionServices.isSubscribed(video.creator._id);
        if (successfull(res)) {
            return res.data.isSubscribed;
        }
    };
    const fetchSubscribersCount = async () => {
        const res = await subscriptionServices.getSubscribersCount(
            video.creator._id
        );
        return res.data;
    };
    const toggleVideoLikeMutation = async () => {
        const res = await likeService.toggleLike(videoId, "video");
        if (successfull(res)) {
            refetchIsLiked();
        }
    };
    const toggleSubscribeMutation = async () => {
        const res = await subscriptionServices.toggleSubscription(
            video.creator._id
        );
        if (successfull(res)) {
            refetchIsSubscribed();
            refetchSubscribersCount();
        }
    };
    const addVideoToPlaylist = async (playlistId: string) => {
        const res = await playlistServices.addVideoToPlaylist(
            videoId,
            playlistId
        );
        if (successfull(res)) {
            return res.data;
        }
    };
    const { mutate: add } = useMutation({
        mutationFn: addVideoToPlaylist,
        mutationKey: ["add-to-playlist", videoId],
    });
    const addToPlaylists = async () => {
        await Promise.all(
            playlistIds.map((playlistId) => {
                add(playlistId);
            })
        );
    };
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
        enabled: !!video && !!userId,
    });

    const { data: isSubscribed, refetch: refetchIsSubscribed } =
        useQuery<boolean>({
            queryKey: ["isSubscribed", video?.creator._id],
            queryFn: fetchIsSubscribed,
            enabled: !!video && !!userId,
        });

    const { data: subscribersCount, refetch: refetchSubscribersCount } =
        useQuery<number>({
            queryKey: ["subscribersCount", video?.creator._id],
            queryFn: fetchSubscribersCount,
            enabled: !!video,
        });

    const { mutate: toggleVideoLike } = useMutation({
        mutationFn: toggleVideoLikeMutation,
        mutationKey: ["toggleLike", videoId, userId],
    });

    const { mutate: toggleSubscription } = useMutation({
        mutationFn: toggleSubscribeMutation,
        mutationKey: ["toggleSubscribe", video?.creator._id, userId],
    });
    const addToWatchHistoryMutation = async () => {
        const res = await userServices.addToWatchHistory(videoId);
        successfull(res);
    };
    const { mutate: addToWatchHistory } = useMutation({
        mutationKey: ["add-to-watch-history", videoId, userId],
        mutationFn: addToWatchHistoryMutation,
    });
    const increaseViews = async () =>
        await videoServices.incrementViews(videoId);
    const { mutate: incrementViews } = useMutation({
        mutationFn: increaseViews,
    });
    useEffect(() => {
        if (video)
            setTimeout(() => {
                addToWatchHistory();
                incrementViews();
            }, 5000);
    }, [video]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error.message}</div>;

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
                            disabled={!userId}
                            variant="default"
                            className={`${
                                !isSubscribed
                                    ? "bg-zinc-300 hover:bg-zinc-400"
                                    : "bg-gray-500 hover:bg-gray-600"
                            } shadow-none text-black rounded-3xl`}
                            onClick={() => toggleSubscription()}
                        >
                            {isSubscribed ? "Subscribed" : "Subscribe"}
                        </Button>
                    </div>

                    <div className="flex gap-2 items-center">
                        <Button
                            disabled={!userId}
                            className={`${isLiked && "text-blue-500"}`}
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
                                <Button disabled={!userId} variant="outline">
                                    <MdOutlinePlaylistAdd className="text-2xl" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 right-0 top-2 absolute bg-gray-400">
                                <SaveToPlaylist
                                    userId={userId}
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
