import { RootState } from "@/provider";
import commentServices from "@/services/comment.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";
import likeServices from "@/services/like.services";
import { IComment } from "@/interfaces";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FiMinus } from "react-icons/fi";
import { GoDot } from "react-icons/go";
import DefaultProfileImage from "@/assets/images/profile.png";
import { ThumbsUp, Trash2 } from "lucide-react";
const Comments = ({ videoId, playerRef }) => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth);
    const [content, setContent] = useState<string>("");
    const {
        data: comments,
        isError: commentsError,
        isLoading: commentsLoading,
        error: commentsErrorObj,
        refetch: refetchComments,
    } = useQuery({
        queryKey: ["comments", videoId],
        queryFn: async (): Promise<IComment[]> => {
            const res = await commentServices.getComments(videoId);
            return res.data.docs;
        },
        enabled: !!videoId,
    });

    const {
        data: liked,
        isError: likedError,
        isLoading: likedLoading,
        error: likedErrorObj,
        refetch: refetchCommentsLike,
    } = useQuery({
        queryKey: ["commentsLike", videoId],
        queryFn: async (): Promise<boolean[]> => {
            const likes: boolean[] = await Promise.all(
                comments.map(async (comment) => {
                    const res = await likeServices.isLiked(
                        comment._id,
                        "comment"
                    );
                    return res.data;
                })
            );
            return likes;
        },
        enabled: !!comments,
    });

    const { mutate: addComment } = useMutation({
        mutationFn: async ({
            videoId,
            content,
        }: {
            videoId: string;
            content: string;
        }) => {
            await commentServices.comment(videoId, content);
        },
        onSuccess: () => {
            setContent("");
            refetchComments();
        },
        onError: (error) => {
            console.error("Error adding comment:", error);
        },
    });

    const { mutate: toggleCommentLike } = useMutation({
        mutationFn: async ({ commentId }: { commentId: string }) => {
            await likeServices.toggleLike(commentId, "comment");
        },
        onSuccess: () => {
            refetchCommentsLike();
        },
        onError: (error) => {
            console.error("Error toggling comment like:", error);
        },
    });

    const { mutate: deleteComment } = useMutation({
        mutationFn: async ({commentId}:{commentId: string}) => {
            await commentServices.deleteComment(commentId);
        },
        onSuccess: () => {
            refetchComments();
        },
        onError: (error: Error) => {
            console.error("Error deleting comment:", error);
        },
    });

    if (commentsLoading || likedLoading)
        return (
            <div className="flex flex-col space-y-4 w-full">
                {[1, 2, 3, 4, 5, 6].map((key) => (
                    <Skeleton
                        key={key}
                        className="h-8 w-full flex space-x-4 items-start"
                    />
                ))}
            </div>
        );
    if (commentsError || likedError)
        return (
            <div>
                ERROR: {commentsErrorObj?.message || likedErrorObj?.message}
            </div>
        );

    const processComment = (
        comment: string,
        onTimestampClick: (seconds: number) => void
    ) => {
        const timestampRegex = /\b(\d{1,2}:\d{2})\b/g;

        const parts = comment.split(timestampRegex);

        return parts.map((part, index) => {
            if (timestampRegex.test(part)) {
                const [minutes, seconds] = part.split(":").map(Number);
                const timeInSeconds = minutes * 60 + seconds;

                return (
                    <a
                        key={index}
                        href="#"
                        className="text-blue-500"
                        onClick={(e) => {
                            e.preventDefault();
                            onTimestampClick(timeInSeconds);
                        }}
                    >
                        {part}
                    </a>
                );
            }

            return <span key={index}>{part}</span>;
        });
    };
    const onTimestampClick = (seconds: number) => {
        if (playerRef.current) {
            playerRef.current.currentTime = seconds;
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
            if (playerRef.current.paused) {
                playerRef.current.play();
            }
        }
    };

    return (
        <div className="px-2">
            <div className="font-bold text-2xl text-zinc-600 dark:text-zinc-300">{`${comments.length} Comments`}</div>
            <div className="flex flex-col">
                {user.userData && (
                    <div className="flex gap-y-1 flex-col justify-start">
                        <div className="flex items-center gap-2">
                            <img
                                src={
                                    user.userData?.avatar || DefaultProfileImage
                                }
                                className="rounded-full h-10 w-10"
                            />
                            <input
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Add a public comment..."
                                className="outline-none shadow-none border-b-[1px] border-b-black dark:border-b-white dark:bg-black w-full"
                            />
                        </div>
                        <div className="flex space-x-2 justify-end">
                            <Button
                                disabled={!content}
                                onClick={() => {
                                    setContent("");
                                }}
                                variant="destructive"
                                className="h-7 sm:h-9"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!content}
                                onClick={() => addComment({videoId,content})}
                                variant="outline"
                                className="hover:bg-blue-500 hover:text-white dark:text-black dark:bg-white dark:hover:bg-blue-500 h-7 sm:h-9 p-1 sm:p-2"
                            >
                                Comment
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col mt-2">
                    {comments.map((comment, index) => {
                        const sentiment = comment.sentiment?.toLowerCase();
                        return (
                            <div
                                key={index}
                                className="flex space-x-4 items-start"
                            >
                                <img
                                    src={
                                        comment.creator.avatar ||
                                        DefaultProfileImage
                                    }
                                    className="rounded-full h-10 w-10 cursor-pointer"
                                    onClick={() =>
                                        navigate(
                                            `/${comment.creator.username}/channel`
                                        )
                                    }
                                    loading="lazy"
                                />
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            onClick={() =>
                                                navigate(
                                                    `/${comment.creator.username}/channel`
                                                )
                                            }
                                            className="text-[16px] cursor-pointer"
                                        >
                                            {`@${comment.creator.username} `}
                                        </div>
                                        <div className="text-gray-500 dark:text-zinc-200 font-light text-[13px]">
                                            {formatDistanceToNow(
                                                new Date(comment.createdAt),
                                                { addSuffix: true }
                                            ).replace("about ", "")}
                                        </div>
                                        <div
                                            className={`flex ${
                                                sentiment == "positive" &&
                                                "bg-green-500"
                                            } ${
                                                sentiment == "negative" &&
                                                "bg-red-500"
                                            } ${
                                                sentiment == "neutral" &&
                                                "bg-yellow-500"
                                            } rounded-full items-center justify-center pl-1 pr-2`}
                                        >
                                            {sentiment === "positive" ? (
                                                <FaPlus className="text-white text-xs mr-1 dark:text-black" />
                                            ) : sentiment === "negative" ? (
                                                <FiMinus className="text-white mr-1 dark:text-black" />
                                            ) : (
                                                <GoDot className="text-white dark:text-black text-xl" />
                                            )}
                                            <span className="text-white dark:text-black text-sm">
                                                {sentiment}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        {processComment(
                                            comment.content,
                                            onTimestampClick
                                        )}
                                    </div>
                                    {user.status && (
                                        <div className="space-x-2 flex items-center">
                                            <Button
                                                onClick={() =>
                                                    toggleCommentLike(
                                                        {commentId:comment._id}
                                                    )
                                                }
                                                variant="ghost"
                                                className={`rounded-full text-lg p-2 dark:hover:bg-zinc-800 dark:hover:text-white ${
                                                    liked[index] &&
                                                    "text-blue-500 dark:hover:text-blue-500"
                                                }`}
                                            >
                                                <ThumbsUp size={18} />
                                            </Button>
                                            {user.userData.username ===
                                                comment.creator.username && (
                                                <Button
                                                    onClick={() =>
                                                        deleteComment(
                                                            {commentId:comment._id}
                                                        )
                                                    }
                                                    variant="ghost"
                                                    className="rounded-full text-lg p-2 dark:hover:bg-zinc-800 dark:hover:text-white"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Comments;
