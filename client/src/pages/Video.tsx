import { Button } from "@/components/ui/button";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/provider";
import { IVideoData } from "@/interfaces";
import { formatDistanceToNow } from "date-fns";
import DefaultProfileImage from "@/assets/images/profile.png";
import videoService from "@/services/video.services";
import subscriptionServices from "@/services/subscription.services";
import likeService from "@/services/like.services";
import { useSuccess } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import SaveToPlaylist from "./SaveToPlaylist";
import Comments from "@/components/root/Comments";
import { useMutation } from "@tanstack/react-query";
import playlistServices from "@/services/playlist.services";
const Video = () => {
    const dispatch = useDispatch();
    const { videoId } = useParams();
    const user = useSelector((state: RootState) => state.auth);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [subscribersCount, setSubscribersCount] = useState<number>(0);
    const [video, setVideo] = useState<IVideoData | null>(null);
    const [playlistIds, setPlaylistIds] = useState<string>("");
    const successfull = useSuccess(dispatch); //custom hook
    const toggleAddPlaylist = async () => {};

    const toggleVideoLike = async () => {
        const res = await likeService.toggleVideoLike(videoId);
        if (successfull(res)) {
            setIsLiked((prev) => !prev);
        }
    };
    const toggleSubscribe = async () => {
        const res = await subscriptionServices.toggleSubscription(
            video.creator._id
        );
        if (successfull(res)) {
            setIsSubscribed((prev) => !prev);
            fetchAndSetSubscribersCount();
        }
    };

    const fetchAndSetIsLiked = async () => {
        const res = await likeService.isLiked(videoId, "video");
        if (successfull(res)) setIsLiked(res.data);
    };

    const fetchAndSetVideo = async () => {
        const res = await videoService.getAVideo(videoId);
        if (successfull(res)) {
            setVideo(res.data);
        }
    };
    const fetchAndSetIsSubscribed = async () => {
        const res = await subscriptionServices.isSubscribed(video.creator._id);
        if (successfull(res)) setIsSubscribed(res.data.isSubscribed);
    };
    const fetchAndSetSubscribersCount = async () => {
        const res = await subscriptionServices.getSubscribersCount(
            video.creator._id
        );
        if (successfull(res)) setSubscribersCount(res.data);
    };
    const addToPlaylist = async (playlistId: string) => {
        const res = await playlistServices.addVideoToPlaylist(
            videoId,
            playlistId
        );
        if (successfull(res)) {
            return res.data;
        }
    };
    const addToPlaylistMutation = useMutation({
        mutationFn: addToPlaylist,
    });
    useEffect(() => {
        if (videoId) {
            fetchAndSetVideo();
        }
    }, [videoId]);

    useEffect(() => {
        if (video) {
            fetchAndSetSubscribersCount();
        }
    }, [video]);

    useEffect(() => {
        if (video && user.status) {
            fetchAndSetIsLiked();
            fetchAndSetIsSubscribed();
        }
    }, [video, user.status]);
    const ref = useRef(null);
    if (!video) return <div>Loading...</div>;
    return (
        <div className="p-2 space-y-4 lg:w-4/5 xl:w-2/3">
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
                            onClick={toggleSubscribe}
                        >
                            {isSubscribed ? "Subscribed" : "Subscribe"}
                        </Button>
                    </div>

                    <div className="flex gap-2 items-center">
                        <Button
                            disabled={!user.status}
                            className={`${isLiked && "text-blue-500"}`}
                            variant="outline"
                            onClick={toggleVideoLike}
                        >
                            <BiLike className="text-2xl" />
                        </Button>
                        <Popover
                            onOpenChange={(open) => {
                                if (!open) {
                                    addToPlaylistMutation.mutate(playlistIds);
                                }
                            }}
                        >
                            <PopoverTrigger>
                                <Button
                                    disabled={!user.status}
                                    variant="outline"
                                    onClick={toggleAddPlaylist}
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
