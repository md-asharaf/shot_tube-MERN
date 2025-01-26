import commentServices from "@/services/Comment";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { formatDistanceToNowStrict, set } from "date-fns";
import likeServices from "@/services/Like";
import { IComment } from "@/interfaces";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FiMinus } from "react-icons/fi";
import { GoDot } from "react-icons/go";
import DefaultProfileImage from "@/assets/images/profile.png";
import {
    ChevronDown,
    ChevronUp,
    Edit,
    EllipsisVertical,
    Loader2,
    ThumbsUp,
    Trash,
} from "lucide-react";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Replies from "./Replies";

const Comments = ({ videoId, playerRef }) => {
    const navigate = useNavigate();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const [isRepliesOpen, setIsRepliesOpen] = useState([]);
    const [targetCommentId, setTargetCommentId] = useState("");
    const [content, setContent] = useState<string>("");
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [inputHeight, setInputHeight] = useState(0);
    const {
        data: commentsPages,
        isLoading: commentsLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ["comments", videoId],
        queryFn: async ({
            pageParam,
        }): Promise<{
            docs: IComment[];
            hasNextPage: boolean;
            totalDocs: number;
        }> => {
            const data = await commentServices.getComments(videoId, pageParam);
            return data.comments;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.hasNextPage ? allPages.length + 1 : undefined,
        enabled: !!videoId,
    });
    let comments = commentsPages?.pages.flatMap((page) => page.docs);
    const totalComments = commentsPages?.pages[0].totalDocs;
    const { data: isLikedOfComments, isLoading: likesLoading } = useQuery({
        queryKey: ["commentsLike", videoId],
        queryFn: async () => {
            const data = await likeServices.getIsLikedOfVideoComments(videoId);
            return data.isLiked;
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
            const data = await commentServices.comment(videoId, content);
            return data.comment;
        },
        onSuccess: (comment) => {
            toast.success("Comment added");
            resetInput();
            commentsPages.pages[0].totalDocs++;
            commentsPages.pages[0].docs.unshift({
                ...comment,
                creator: userData,
            });
        },
    });

    const { mutate: toggleCommentLike } = useMutation({
        mutationFn: async ({ commentId }: { commentId: string }) => {
            await likeServices.toggleLike(commentId, "comment");
        },
        onSuccess: (_, vars) => {
            isLikedOfComments[vars.commentId] =
                !isLikedOfComments[vars.commentId];
        },
    });

    const { mutate: deleteComment } = useMutation({
        mutationFn: async ({ commentId }: { commentId: string }) => {
            const data = await commentServices.deleteComment(commentId);
            return data.commentId;
        },
        onSuccess: (commentId) => {
            toast.success("Comment deleted");
            commentsPages.pages[0].totalDocs--;
            commentsPages.pages.forEach((page) => {
                page.docs = page.docs.filter(
                    (comment) => comment._id !== commentId
                );
            });
        },
    });
    const { mutate: updateComment } = useMutation({
        mutationFn: async () => {
            await commentServices.updateComment(targetCommentId, content);
        },
        onSuccess: () => {
            commentsPages.pages.forEach((page) => {
                page.docs.forEach((comment) => {
                    if (comment._id === targetCommentId)
                        comment.content = content;
                });
            });
            resetInput();
            toast.success("Comment updated");
        },
    });
    const resetInput = () => {
        setContent("");
        setTargetCommentId("");
        setIsInputFocused(false);
        setInputHeight(0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setInputHeight(e.target.scrollHeight);
    };
    const observerCallback = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    const getRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (!node) return;

            const observer = new IntersectionObserver(observerCallback, {
                threshold: 0.5,
            });
            observer.observe(node);
        },
        [observerCallback]
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
    if (commentsLoading || likesLoading)
        return (
            <div className="w-full flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    return (
        <div className="px-2">
            <div className="font-bold text-2xl text-zinc-600 dark:text-zinc-300 mb-2">
                {`${totalComments} Comments`}
            </div>
            <div className="flex flex-col">
                {userData && isPending ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
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
                                    onClick={resetInput}
                                    variant="ghost"
                                    className="h-7 sm:h-9 rounded-full"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={content === ""}
                                    onClick={() =>
                                        targetCommentId
                                            ? updateComment()
                                            : addComment({ videoId, content })
                                    }
                                    variant="outline"
                                    className="bg-blue-500 hover:bg-blue-400 h-7 sm:h-9 p-1 sm:p-3 rounded-full"
                                >
                                    {targetCommentId ? "Save" : "Comment"}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col mt-2 space-y-2 overflow-y-auto overflow-x-hidden">
                    {comments?.map((comment, index) => {
                        const sentiment = comment.sentiment?.toLowerCase();
                        return (
                            <div key={index} className="flex justify-between">
                                <div className="flex space-x-2 items-start">
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
                                                            viewTransition:
                                                                true,
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
                                        <div className="break-words whitespace-pre-wrap">
                                            {processComment(
                                                comment.content,
                                                onTimestampClick
                                            )}
                                        </div>
                                        {userData && (
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                onClick={() =>
                                                    toggleCommentLike({
                                                        commentId: comment._id,
                                                    })
                                                }
                                                variant="ghost"
                                                className={`rounded-full text-lg p-2 dark:hover:bg-zinc-800 dark:hover:text-white ${
                                                    isLikedOfComments &&
                                                    isLikedOfComments[
                                                        comment._id
                                                    ] &&
                                                    "text-blue-500 dark:hover:text-blue-500"
                                                }`}
                                            >
                                                <ThumbsUp size={18} />
                                            </Button>
                                            <button className="text-sm rounded-full p-2 dark:hover:bg-zinc-800 dark:hover:text-white">
                                                reply
                                            </button>
                                            </div>
                                        )}
                                        <Collapsible
                                            onOpenChange={(open) => {
                                                const updatedRepliesOpen = [...isRepliesOpen];
                                                updatedRepliesOpen[index] = open; 
                                                setIsRepliesOpen(updatedRepliesOpen);
                                            }}
                                        >
                                            <CollapsibleTrigger asChild>
                                                <button className="flex space-x-1 text-indigo-500">
                                                    {isRepliesOpen[index] ? (
                                                        <ChevronUp />
                                                    ) : (
                                                        <ChevronDown />
                                                    )}{" "}
                                                    <span>replies</span>
                                                </button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <Replies
                                                    commentId={comment._id}
                                                />
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>
                                </div>
                                {userData?._id === comment.creator._id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <EllipsisVertical className="cursor-pointer h-5 mt-2" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-white dark:bg-[#212121] p-0 py-2">
                                            <DropdownMenuItem
                                                className="rounded-none dark:hover:bg-[#535353] hover:bg-[#E5E5E5] px-2"
                                                onClick={() => {
                                                    setTargetCommentId(
                                                        comment._id
                                                    );
                                                    setContent(comment.content);
                                                    setIsInputFocused(true);
                                                }}
                                            >
                                                <Edit className="h-5 w-5 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="rounded-none dark:hover:bg-[#535353] hover:bg-[#E5E5E5]"
                                                onClick={() =>
                                                    deleteComment({
                                                        commentId: comment._id,
                                                    })
                                                }
                                            >
                                                <Trash className="h-5 w-5 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        );
                    })}
                    <div
                        className="h-10 flex items-center justify-center"
                        ref={getRef}
                    >
                        {isFetchingNextPage && (
                            <Loader2 className="h-10 w-10 animate-spin" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comments;
