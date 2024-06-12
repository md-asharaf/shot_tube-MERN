import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BiLike } from "react-icons/bi";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/provider";
import { IComment, IVideoData } from "@/interfaces";
import { formatDistanceToNow } from "date-fns";
import DefaultProfileImage from "@/assets/images/profile.png";
import videoService from "@/services/video.services";
import commentService from "@/services/comment.services";
import subscriptionServices from "@/services/subscription.services";
import likeService from "@/services/like.services";
import { useSuccess } from "@/lib/utils";
const Video = () => {
    const dispatch = useDispatch();
    const { videoId } = useParams();
    const user = useSelector((state: RootState) => state.auth);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [subscribersCount, setSubscribersCount] = useState<number>(0);
    const [video, setVideo] = useState<IVideoData | null>(null);
    const [comments, setComments] = useState<IComment[]>([]);
    const [comment, setComment] = useState<string>("");
    const [liked, setLiked] = useState<boolean[]>([]);

    const [cancelCommentButton, setCancelCommentButton] =
        useState<boolean>(false);
    const isSuccess = useSuccess(dispatch); //custom hook
    const toggleAddPlaylist = async () => {};
    const toggleCommentLike = async (commentId: string, index: number) => {
        const res = await likeService.toggleCommentLike(commentId);
        if (isSuccess(res)) {
            setLiked((prev) =>
                prev.map((like, i) => (i === index ? !like : like))
            );
        }
    };
    const toggleVideoLike = async () => {
        const res = await likeService.toggleVideoLike(videoId);
        if (isSuccess(res)) {
            setIsLiked((prev) => !prev);
        }
    };
    const addComment = async () => {
        const res = await commentService.comment(videoId, comment);
        if (isSuccess(res)) {
            setComment("");
            fetchAndSetComments();
            setCancelCommentButton(false);
        }
    };
    const deleteComment = async (commentId: string) => {
        const res = await commentService.deleteComment(commentId);
        if (isSuccess(res)) {
            fetchAndSetComments();
        }
    };
    const toggleSubscribe = async () => {
        const res = await subscriptionServices.toggleSubscription(
            video.creator._id
        );
        if (isSuccess(res)) {
            setIsSubscribed((prev) => !prev);
            fetchAndSetSubscribersCount();
        }
    };
    const fetchAndSetLiked = async () => {
        let likes: boolean[] = [];
        for (let i = 0; i < comments.length; i++) {
            const res = await likeService.isLiked(comments[i]._id, "comment");
            if (isSuccess(res)) {
                likes.push(res.data);
            }
        }
        setLiked(likes);
    };
    const fetchAndSetIsLiked = async () => {
        const res = await likeService.isLiked(videoId, "video");
        if (isSuccess(res)) setIsLiked(res.data);
    };
    const fetchAndSetComments = async () => {
        const res = await commentService.getComments(videoId);
        if (isSuccess(res)) {
            setComments(res.data.docs);
        }
    };
    const fetchAndSetVideo = async () => {
        const res = await videoService.getAVideo(videoId);
        if (isSuccess(res)) {
            setVideo(res.data);
        }
    };
    const fetchAndSetIsSubscribed = async () => {
        const res = await subscriptionServices.isSubscribed(video.creator._id);
        if (isSuccess(res)) setIsSubscribed(res.data.isSubscribed);
    };
    const fetchAndSetSubscribersCount = async () => {
        const res = await subscriptionServices.getSubscribersCount(
            video.creator._id
        );
        if (isSuccess(res)) setSubscribersCount(res.data);
    };
    useEffect(() => {
        if (comments.length > 0) {
            fetchAndSetLiked();
        }
    }, [comments]);

    useEffect(() => {
        if (videoId) {
            fetchAndSetVideo();
        }
    }, [videoId]);

    useEffect(() => {
        if (video) {
            fetchAndSetComments();
            fetchAndSetSubscribersCount();
        }
    }, [video]);

    useEffect(() => {
        if (video && user.status) {
            fetchAndSetIsLiked();
            fetchAndSetIsSubscribed();
        }
    }, [video, user.status]);
    return (
        <div className="my-2 mx-10 space-y-4 lg:w-4/5 xl:w-2/3">
            {video && (
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
                            <Button
                                disabled={!user.status}
                                variant="outline"
                                onClick={toggleAddPlaylist}
                            >
                                <MdOutlinePlaylistAdd className="text-2xl" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 shadow-md rounded-xl bg-gray-300 font-semibold">
                        <div className="flex space-x-4">
                            <div>{`${video.views} views`}</div>
                            <div>
                                {formatDistanceToNow(
                                    new Date(video.createdAt),
                                    { addSuffix: true }
                                )}
                            </div>
                        </div>
                        <div>{video.description}</div>
                    </div>
                    <div className="font-bold text-2xl text-zinc-600">{`${comments.length} Comments`}</div>
                    <div className="flex flex-col">
                        <div className="flex gap-x-2 items-center justify-start">
                            <img
                                src={
                                    user.userData?.avatar?.url ||
                                    DefaultProfileImage
                                }
                                className="rounded-full h-10 w-10"
                            />
                            <Input
                                disabled={!user.status}
                                onFocus={() => setCancelCommentButton(true)}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a public comment..."
                                className="border-none shadow-none"
                            />
                            {cancelCommentButton && (
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => {
                                            setComment("");
                                            setCancelCommentButton(false);
                                        }}
                                        variant="destructive"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={!comment}
                                        onClick={addComment}
                                        variant="outline"
                                        className="hover:bg-blue-500 hover:text-white"
                                    >
                                        Comment
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="w-full border-b-2 border-gray-300 mb-8 mt-4"></div>

                        <div className="flex flex-col space-y-4">
                            {comments.map((coment, index) => (
                                <div
                                    key={index}
                                    className="flex space-x-4 items-start"
                                >
                                    <img
                                        src={
                                            coment.creator.avatar?.url ||
                                            DefaultProfileImage
                                        }
                                        className="rounded-full h-10 w-10"
                                    />
                                    <div>
                                        <div>
                                            <span className="text-[16px]">{`@${coment.creator.username} `}</span>
                                            <span className="text-gray-500 font-light text-[13px]">
                                                {formatDistanceToNow(
                                                    new Date(coment.createdAt),
                                                    { addSuffix: true }
                                                ).replace("about ", "")}
                                            </span>
                                        </div>
                                        <div>{coment.content}</div>
                                        {user.status && (
                                            <div className="space-x-2 flex items-center">
                                                <Button
                                                    onClick={() =>
                                                        toggleCommentLike(
                                                            coment._id,
                                                            index
                                                        )
                                                    }
                                                    variant="ghost"
                                                    className={`rounded-full text-lg p-2 ${
                                                        liked[index] &&
                                                        "text-blue-500"
                                                    }`}
                                                >
                                                    <BiLike />
                                                </Button>
                                                {user.userData.username ===
                                                    coment.creator.username && (
                                                    <Button
                                                        onClick={() =>
                                                            deleteComment(
                                                                coment._id
                                                            )
                                                        }
                                                        variant="ghost"
                                                        className="rounded-full text-lg p-2"
                                                    >
                                                        <RiDeleteBin6Line />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Video;
