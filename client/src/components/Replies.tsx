import { useCallback, useState } from "react";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import replyService from "@/services/Reply";
import { Button } from "@/components/ui/button";
import { Edit, EllipsisVertical, Loader2, ThumbsUp, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict, set } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import likeServices from "@/services/Like";
import replyServices from "@/services/Reply";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import TextArea from "./ReusableTextArea";
import { IReply } from "@/interfaces";
import { toast } from "sonner";
import { queryClient } from "@/main";
import AvatarImg from "./AvatarImg";

const Replies = ({
    commentId,
    onTimestampClick,
}: {
    commentId: string;
    onTimestampClick: (prop: any) => void;
}) => {
    const theme = useSelector((state: RootState) => state.theme.mode);
    const userData = useSelector((state: RootState) => state.auth?.userData);
    const navigate = useNavigate();
    const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
    const [replyingToReplyId, setReplyingToReplyId] = useState<string | null>(
        null
    );
    const {
        data: repliesPages,
        isLoading: repliesLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ["replies", commentId],
        queryFn: async ({
            pageParam,
        }): Promise<{
            docs: IReply[];
            hasNextPage: boolean;
        }> => {
            const data = await replyService.getReplies(commentId, pageParam);
            return data.replies;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage.hasNextPage ? allPages.length + 1 : undefined,
    });

    const replies = repliesPages?.pages.flatMap((page) => page.docs);
    const { data: isLikedOfReplies = {}, isLoading: LikesLoading } = useQuery({
        queryKey: ["isLikedOfReplies", commentId],
        queryFn: async () => {
            const data = await likeServices.getCommentRepliesLike(commentId);
            return data.isLiked;
        },
    });
    const { mutate: toggleReplyLike } = useMutation({
        mutationFn: async (replyId: string) =>
            await likeServices.toggleLike(replyId, "reply"),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["isLikedOfReplies", commentId],
                exact: true,
            });
        },
    });
    const { mutate: deleteReply, isPending: isDeletionPending } = useMutation({
        mutationFn: async (replyId: string) =>
            await replyService.deleteReply(replyId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["replies", commentId],
                exact: true,
            });
            toast.success("Reply deleted");
        },
    });

    const { mutate: updateReply, isPending: isUpdationPending } = useMutation({
        mutationFn: async (content: string) =>
            await replyService.updateReply(editingReplyId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["replies", commentId],
                exact: true,
            });
            toast.success("Reply updated");
        },
        onSettled: () => {
            setEditingReplyId(null);
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
    const { mutate: addReply, isPending: isAdditionPending } = useMutation({
        mutationFn: async (content: string) => {
            const data = await replyServices.addReply(commentId, content);
            return data.reply;
        },
        onSuccess: (reply) => {
            setReplyingToReplyId(null);
            queryClient.invalidateQueries({
                queryKey: ["replies", commentId],
                exact: true,
            });
            toast.success("Reply added");
        },
    });
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
    const processReply = (
        reply: string,
        onTimestampClick: (seconds: number) => void
    ) => {
        const timestampRegex = /\b(\d{1,2}:\d{2})\b/g;

        const parts = reply.split(timestampRegex);

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
    if (repliesLoading || LikesLoading) {
        <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
        </div>;
    }
    return (
        <div className="flex flex-col space-y-2 overflow-y-auto overflow-x-hidden">
            {isDeletionPending && (
                <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            )}
            {replies?.map((reply) => {
                return (
                    <div key={reply._id}>
                        {editingReplyId === reply._id ? (
                            isUpdationPending ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <TextArea
                                    fullname={userData?.fullname}
                                    userAvatar={userData?.avatar}
                                    initialValue={reply.content}
                                    onSubmit={(content) => updateReply(content)}
                                    onCancel={() => setEditingReplyId(null)}
                                    submitLabel="Save"
                                />
                            )
                        ) : (
                            <div>
                                <div className="flex justify-between">
                                    <div className="flex space-x-2 items-start">
                                        <div
                                            className="rounded-full h-8 w-8 cursor-pointer"
                                            onClick={() =>
                                                navigate(
                                                    `/channel?u=${reply.creator.username}`
                                                )
                                            }
                                        >
                                            <AvatarImg
                                                fullname={
                                                    reply.creator.fullname
                                                }
                                                avatar={reply.creator.avatar}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    onClick={() =>
                                                        navigate(
                                                            `/channel?u=${reply.creator.username}`
                                                        )
                                                    }
                                                    className="text-sm font-medium cursor-pointer"
                                                >
                                                    {`@${reply.creator.username} `}
                                                </div>
                                                <div className="text-gray-500 dark:text-zinc-400 text-[12px]">
                                                    {formatDistanceToNowStrict(
                                                        new Date(
                                                            reply.createdAt
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                            <div className="break-words whitespace-pre-wrap">
                                                {processReply(
                                                    reply.content,
                                                    onTimestampClick
                                                )}
                                            </div>
                                            {userData && (
                                                <div className="flex items-center">
                                                    <Button
                                                        onClick={() =>
                                                            toggleReplyLike(
                                                                reply._id
                                                            )
                                                        }
                                                        variant="ghost"
                                                        className="rounded-full p-2"
                                                    >
                                                        <ThumbsUp
                                                            fill={
                                                                isLikedOfReplies[
                                                                    reply._id
                                                                ]?.status
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
                                                        {Number(
                                                            isLikedOfReplies[
                                                                reply._id
                                                            ]?.count
                                                        ) ?? ""}
                                                    </Button>
                                                    <Button
                                                        className="text-sm rounded-full"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setReplyingToReplyId(
                                                                reply._id
                                                            )
                                                        }
                                                    >
                                                        reply
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {userData?._id === reply.creator._id && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <EllipsisVertical className="cursor-pointer h-5 mt-2" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-white dark:bg-[#212121] p-0 py-2">
                                                <DropdownMenuItem
                                                    className="rounded-none dark:hover:bg-[#535353] hover:bg-[#E5E5E5] px-2"
                                                    onClick={() =>
                                                        setEditingReplyId(
                                                            reply._id
                                                        )
                                                    }
                                                >
                                                    <Edit className="h-5 w-5 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="rounded-none dark:hover:bg-[#535353] hover:bg-[#E5E5E5]"
                                                    onClick={() =>
                                                        deleteReply(reply._id)
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
                                    {isAdditionPending ? (
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        </div>
                                    ) : (
                                        replyingToReplyId === reply._id && (
                                            <TextArea
                                                fullname={userData?.fullname}
                                                initialValue={
                                                    "@" + reply.creator.username
                                                }
                                                userAvatar={userData?.avatar}
                                                placeholder="Add a reply..."
                                                onSubmit={(content) => {
                                                    addReply(content);
                                                }}
                                                onCancel={() =>
                                                    setReplyingToReplyId(null)
                                                }
                                                submitLabel="Reply"
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="flex items-center justify-center" ref={getRef}>
                {isFetchingNextPage && (
                    <Loader2 className="h-10 w-10 animate-spin" />
                )}
            </div>
        </div>
    );
};

export default Replies;
