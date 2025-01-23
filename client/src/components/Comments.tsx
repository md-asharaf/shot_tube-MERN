import commentServices from "@/services/Comment";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { formatDistanceToNowStrict } from "date-fns";
import likeServices from "@/services/Like";
import { IComment } from "@/interfaces";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FiMinus } from "react-icons/fi";
import { GoDot } from "react-icons/go";
import DefaultProfileImage from "@/assets/images/profile.png";
import { Loader2, ThumbsUp, Trash2 } from "lucide-react";
import { RootState } from "@/store/store";

const Comments = ({ videoId, playerRef }) => {
    const navigate = useNavigate();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const [content, setContent] = useState<string>("");
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [inputHeight, setInputHeight] = useState(0);
    const {
        data: comments,
        isLoading: commentsLoading,
        refetch: refetchComments,
    } = useQuery({
        queryKey: ["comments", videoId],
        queryFn: async (): Promise<IComment[]> => {
            const data = await commentServices.getComments(videoId);
            return data.comments.docs;
        },
        enabled: !!videoId,
    });

    const {
        data: liked,
        isLoading: likedLoading,
        refetch: refetchCommentsLike,
    } = useQuery({
        queryKey: ["commentsLike", videoId],
        queryFn: async (): Promise<boolean[]> => {
            const likes: boolean[] = await Promise.all(
                comments?.map(async (comment) => {
                    const data = await likeServices.isLiked(
                        comment._id,
                        "comment"
                    );
                    return data.isLiked;
                })
            );
            return likes;
        },
        enabled: !!comments && !!userData,
    });

    const { mutate: addComment, isPending } = useMutation({
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
            return true;
        },
    });

    const { mutate: toggleCommentLike } = useMutation({
        mutationFn: async ({ commentId }: { commentId: string }) => {
            await likeServices.toggleLike(commentId, "comment");
        },
        onSuccess: () => {
            refetchCommentsLike();
            return true;
        },
    });

    const { mutate: deleteComment } = useMutation({
        mutationFn: async ({ commentId }: { commentId: string }) => {
            await commentServices.deleteComment(commentId);
        },
        onSuccess: () => {
            refetchComments();
            return true;
        },
    });

    const handleCancelClick = () => {
        setContent("");
        setIsInputFocused(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setInputHeight(e.target.scrollHeight);
    };

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

    if (commentsLoading || likedLoading)
        return (
            <div className="w-full flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );

    return (
        <div className="px-2">
            <div className="font-bold text-2xl text-zinc-600 dark:text-zinc-300 mb-2">
                {`${comments.length} Comments`}
            </div>
            <div className="flex flex-col">
                {userData && (
                    <div className="flex gap-y-1 flex-col justify-start">
                        <div className="flex items-center gap-2">
                            <img
                                src={userData?.avatar || DefaultProfileImage}
                                className="rounded-full h-10 w-10"
                            />
                            <textarea
                                value={content}
                                onChange={handleInputChange}
                                placeholder="Add a public comment..."
                                className={`outline-none shadow-none dark:bg-black w-full resize-none overflow-hidden border-b border-gray-500 focus:border-gray-300 transition-all`}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => {
                                    if (!content) {
                                        setIsInputFocused(false);
                                    }
                                }}
                                style={{ height: inputHeight || "25px" }}
                            />
                        </div>

                        {(isInputFocused || content) && (
                            <div className="flex space-x-2 justify-end">
                                <Button
                                    onClick={handleCancelClick}
                                    variant="ghost"
                                    className="h-7 sm:h-9 rounded-full"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={content === ""}
                                    onClick={() =>
                                        addComment({ videoId, content })
                                    }
                                    variant="outline"
                                    className="bg-blue-500 hover:bg-blue-400 h-7 sm:h-9 p-1 sm:p-2 rounded-full"
                                >
                                    {isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Comment"
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col mt-2 space-y-2">
                    {comments?.map((comment, index) => {
                        const sentiment = comment.sentiment?.toLowerCase();
                        return (
                            <div
                                key={index}
                                className="flex space-x-2 items-start"
                            >
                                <img
                                    src={
                                        comment.creator.avatar ||
                                        DefaultProfileImage
                                    }
                                    className="rounded-full h-10 w-10 cursor-pointer"
                                    onClick={() =>
                                        navigate(
                                            `/${comment.creator.username}/channel`,
                                            {
                                                viewTransition: true,
                                            }
                                        )
                                    }
                                    loading="lazy"
                                />
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            onClick={() =>
                                                navigate(
                                                    `/${comment.creator.username}/channel`,
                                                    {
                                                        viewTransition: true,
                                                    }
                                                )
                                            }
                                            className="text-sm font-medium cursor-pointer"
                                        >
                                            {`@${comment.creator.username} `}
                                        </div>
                                        <div className="text-gray-500 dark:text-zinc-400 text-[12px]">
                                            {formatDistanceToNowStrict(
                                                new Date(comment.createdAt),
                                                {
                                                    addSuffix: true,
                                                }
                                            )}
                                        </div>
                                        <div
                                            className={`flex ${
                                                sentiment === "positive" &&
                                                "bg-green-500"
                                            } ${
                                                sentiment === "negative" &&
                                                "bg-red-500"
                                            } ${
                                                sentiment === "neutral" &&
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
                                    {userData && (
                                        <div className="space-x-2 flex items-center">
                                            <Button
                                                onClick={() =>
                                                    toggleCommentLike({
                                                        commentId: comment._id,
                                                    })
                                                }
                                                variant="ghost"
                                                className={`rounded-full text-lg p-2 dark:hover:bg-zinc-800 dark:hover:text-white ${
                                                    liked &&
                                                    liked[index] &&
                                                    "text-blue-500 dark:hover:text-blue-500"
                                                }`}
                                            >
                                                <ThumbsUp size={18} />
                                            </Button>
                                            {userData?.username ===
                                                comment.creator.username && (
                                                <Button
                                                    onClick={() =>
                                                        deleteComment({
                                                            commentId:
                                                                comment._id,
                                                        })
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
