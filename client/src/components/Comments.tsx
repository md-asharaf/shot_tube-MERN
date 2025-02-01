import commentServices from "@/services/Comment";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { formatDistanceToNowStrict } from "date-fns";
import likeServices from "@/services/Like";
import { IComment } from "@/interfaces";
import { useNavigate } from "react-router-dom";
import { memo, useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FiMinus } from "react-icons/fi";
import { GoDot } from "react-icons/go";
import replyServices from "@/services/Reply";
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
import TextArea from "./ReusableTextArea";
import { queryClient } from "@/main";
import AvatarImg from "./AvatarImg";
import CommentFilter from "./CommentFilter";

const Comments = ({ videoId, playerRef, videoCreatorId }) => {
    const [filter, setFilter] = useState("All");
    const theme = useSelector((state: RootState) => state.theme.mode);
    const navigate = useNavigate();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const [isRepliesOpen, setIsRepliesOpen] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(
        null
    );
    const [replyingToCommentId, setReplyingToCommentId] = useState<
        string | null
    >(null);
    const {
        data: commentsPages,
        isLoading: commentsLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: [`comments/${filter}`, videoId],
        queryFn: async ({
            pageParam,
        }): Promise<{
            docs: IComment[];
            hasNextPage: boolean;
            totalDocs: number;
        }> => {
            const data = await commentServices.getComments(
                videoId,
                pageParam,
                filter
            );
            return data.comments;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.hasNextPage ? allPages.length + 1 : undefined,
        enabled: !!videoId,
    });
    const comments = commentsPages?.pages.flatMap((page) => page.docs);
    const totalComments = commentsPages?.pages[0].totalDocs;
    const { data: isLikedOfComments, isLoading: likesLoading } = useQuery({
        queryKey: ["commentsLike", videoId],
        queryFn: async () => {
            const data = await likeServices.getVideoCommentsLike(videoId);
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
            commentsPages.pages[0].totalDocs++;
            commentsPages.pages[0].docs.unshift({
                ...comment,
                creator: userData,
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const { mutate: toggleCommentLike } = useMutation({
        mutationFn: async (commentId: string) => {
            await likeServices.toggleLike(commentId, "comment");
        },
        onSuccess: (_, commentId) => {
            isLikedOfComments[commentId] = {
                status: !isLikedOfComments[commentId]?.status,
                count:
                    isLikedOfComments[commentId]?.count +
                    (isLikedOfComments[commentId]?.status ? -1 : 1),
            };
        },
    });

    const { mutate: deleteComment } = useMutation({
        mutationFn: async (commentId: string) => {
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
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const { mutate: updateComment } = useMutation({
        mutationFn: async (content: string) => {
            await commentServices.updateComment(editingCommentId, content);
        },
        onSuccess: (_, content) => {
            commentsPages.pages.forEach((page) => {
                page.docs.forEach((comment) => {
                    if (comment._id === editingCommentId)
                        comment.content = content;
                });
            });
            toast.success("Comment updated");
        },
        onSettled: () => {
            setEditingCommentId(null);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const { mutate: addReply } = useMutation({
        mutationFn: async (content: string) => {
            const data = await replyServices.addReply(
                replyingToCommentId,
                content
            );
            return data.reply;
        },
        onSuccess: () => {
            toast.success("Reply added");
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["replies", replyingToCommentId],
                exact: true,
            });
            setReplyingToCommentId(null);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
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

            return (
                <span key={index}>
                    {part}
                </span>
            );
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
        <div className="px-2 space-y-2">
            <div className="flex sm:space-x-16 items-center justify-between sm:justify-normal">
                <div className="font-bold text-2xl text-zinc-600 dark:text-zinc-300 mb-2">
                    {`${totalComments} Comments`}
                </div>
                <div>
                    <CommentFilter onFilterChange={setFilter} filter={filter} />
                </div>
            </div>
            <div className="flex flex-col">
                {userData && isPending ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <TextArea
                        fullname={userData?.fullname}
                        userAvatar={userData?.avatar}
                        placeholder="Add a public comment..."
                        onSubmit={(content) => addComment({ videoId, content })}
                        submitLabel="Comment"
                    />
                )}

                <div className="flex flex-col mt-4 space-y-2 overflow-y-auto">
                    {comments?.map((comment, index) => {
                        const sentiment = comment.sentiment?.toLowerCase();
                        return (
                            <div key={comment._id}>
                                {editingCommentId === comment._id ? (
                                    <TextArea
                                        fullname="userData?.fullname"
                                        userAvatar={userData?.avatar}
                                        initialValue={comment.content}
                                        onSubmit={(content) =>
                                            updateComment(content)
                                        }
                                        onCancel={() =>
                                            setEditingCommentId(null)
                                        }
                                        submitLabel="Save"
                                    />
                                ) : (
                                    <div>
                                        <div className="flex justify-between">
                                            <div className="flex space-x-2 items-start">
                                                <div
                                                    className="rounded-full h-10 min-w-10 cursor-pointer"
                                                    onClick={() =>
                                                        navigate(
                                                            `/channel?u=${comment.creator?.username}`
                                                        )
                                                    }
                                                >
                                                    <AvatarImg
                                                        fullname={
                                                            comment.creator.fullname
                                                        }
                                                        avatar={
                                                            comment.creator
                                                                .avatar
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            onClick={() =>
                                                                navigate(
                                                                    `/channel?u=${comment.creator.username}`
                                                                )
                                                            }
                                                            className="text-sm font-medium cursor-pointer"
                                                        >
                                                            {`@${comment.creator.username} `}
                                                        </div>
                                                        <div className="text-gray-500 dark:text-zinc-400 text-[12px]">
                                                            {formatDistanceToNowStrict(
                                                                new Date(
                                                                    comment.createdAt
                                                                ),
                                                                {
                                                                    addSuffix:
                                                                        true,
                                                                }
                                                            )}
                                                        </div>
                                                        {userData._id ===
                                                            videoCreatorId && (
                                                            <div
                                                                className={`flex ${
                                                                    sentiment ===
                                                                        "positive" &&
                                                                    "bg-green-500"
                                                                } ${
                                                                    sentiment ===
                                                                        "negative" &&
                                                                    "bg-red-500"
                                                                } ${
                                                                    sentiment ===
                                                                        "neutral" &&
                                                                    "bg-yellow-500"
                                                                } rounded-full items-center justify-center pl-1 pr-2`}
                                                            >
                                                                {sentiment ===
                                                                "positive" ? (
                                                                    <FaPlus className="text-white text-xs mr-1 dark:text-black" />
                                                                ) : sentiment ===
                                                                  "negative" ? (
                                                                    <FiMinus className="text-white mr-1 dark:text-black" />
                                                                ) : (
                                                                    <GoDot className="text-white dark:text-black text-xl" />
                                                                )}
                                                                <span className="text-white dark:text-black text-sm">
                                                                    {sentiment}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="break-all whitespace-pre-wrap">
                                                        {processComment(
                                                            comment.content,
                                                            onTimestampClick
                                                        )}
                                                    </div>
                                                    {userData && (
                                                        <div className="flex items-center">
                                                            <Button
                                                                onClick={() =>
                                                                    toggleCommentLike(
                                                                        comment._id
                                                                    )
                                                                }
                                                                variant="ghost"
                                                                className="rounded-full p-2"
                                                            >
                                                                <ThumbsUp
                                                                    fill={
                                                                        isLikedOfComments[
                                                                            comment
                                                                                ._id
                                                                        ]
                                                                            ?.status
                                                                            ? theme ==
                                                                              "dark"
                                                                                ? "white"
                                                                                : "black"
                                                                            : theme ==
                                                                              "dark"
                                                                            ? "black"
                                                                            : "white"
                                                                    }
                                                                />{" "}
                                                                {isLikedOfComments[
                                                                    comment._id
                                                                ]?.count ?? ""}
                                                            </Button>
                                                            <Button
                                                                className="text-sm rounded-full"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    setReplyingToCommentId(
                                                                        comment._id
                                                                    )
                                                                }
                                                            >
                                                                reply
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {userData?._id ===
                                                comment.creator._id && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <EllipsisVertical className="cursor-pointer h-5 mt-2" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="bg-white dark:bg-[#212121] p-0">
                                                        <DropdownMenuItem
                                                            className="rounded-none dark:hover:bg-[#535353] hover:bg-[#E5E5E5] px-4 py-3"
                                                            onClick={() =>
                                                                setEditingCommentId(
                                                                    comment._id
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-5 w-5 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="rounded-none dark:hover:bg-[#535353] hover:bg-[#E5E5E5] px-4 py-3"
                                                            onClick={() =>
                                                                deleteComment(
                                                                    comment._id
                                                                )
                                                            }
                                                        >
                                                            <Trash className="h-5 w-5 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                        <div className="ml-12">
                                            {replyingToCommentId ===
                                                comment._id && (
                                                <TextArea
                                                    fullname="userData?.fullname"
                                                    userAvatar={
                                                        userData?.avatar
                                                    }
                                                    placeholder="Add a reply..."
                                                    onSubmit={(content) => {
                                                        addReply(content);
                                                        comment.repliesCount += 1;
                                                    }}
                                                    onCancel={() =>
                                                        setReplyingToCommentId(
                                                            null
                                                        )
                                                    }
                                                    submitLabel="Reply"
                                                />
                                            )}
                                            {comment.repliesCount > 0 && (
                                                <Collapsible
                                                    onOpenChange={(open) => {
                                                        const updatedRepliesOpen =
                                                            [...isRepliesOpen];
                                                        updatedRepliesOpen[
                                                            index
                                                        ] = open;
                                                        setIsRepliesOpen(
                                                            updatedRepliesOpen
                                                        );
                                                    }}
                                                >
                                                    <CollapsibleTrigger asChild>
                                                        <Button
                                                            className="rounded-full flex space-x-1 text-indigo-500 hover:bg-indigo-500/30"
                                                            variant="ghost"
                                                        >
                                                            {isRepliesOpen[
                                                                index
                                                            ] ? (
                                                                <ChevronUp />
                                                            ) : (
                                                                <ChevronDown />
                                                            )}
                                                            <span>{`${
                                                                comment.repliesCount
                                                            } ${
                                                                comment.repliesCount ==
                                                                1
                                                                    ? "reply"
                                                                    : "replies"
                                                            }`}</span>
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <Replies
                                                            onTimestampClick={
                                                                onTimestampClick
                                                            }
                                                            commentId={
                                                                comment._id
                                                            }
                                                        />
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div
                        className="flex items-center justify-center"
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
