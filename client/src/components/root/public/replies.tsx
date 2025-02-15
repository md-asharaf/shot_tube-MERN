import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { replyService } from "@/services/reply";
import { Button } from "@/components/ui/button";
import { Edit, EllipsisVertical, Loader2, ThumbsUp, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { likeService } from "@/services/like";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { TextArea } from "../text-area";
import { IReply } from "@/interfaces";
import { toast } from "sonner";
import { queryClient } from "@/main";
import { AvatarImg } from "../avatar-image";
import { useIntersection } from "@mantine/hooks";
import { processText } from "@/lib";

const Replies = ({
    commentId,
    playerRef,
}: {
    commentId: string;
    playerRef: any;
}) => {
    const theme = useSelector((state: RootState) => state.theme.mode);
    const userData = useSelector((state: RootState) => state.auth?.userData);
    const navigate = useNavigate();
    const lastReplyRef = useRef(null);
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
    const { data: likeStatusOfReplies, isLoading: likeStatusLoading } =
        useQuery({
            queryKey: ["replies-like-status", commentId],
            queryFn: async () => {
                const data = await likeService.getRepliesLikeStatus(commentId);
                console.log({ data });
                return data.likedStatus;
            },
            enabled: !!userData && !!replies,
        });

    const { data: likesCountOfReplies, isLoading: likesCountLoading } =
        useQuery({
            queryKey: ["replies-likes-count", commentId],
            queryFn: async (): Promise<number[]> => {
                const data = await likeService.getRepliesLikesCount(commentId);
                return data.likesCount;
            },
            enabled: !!replies,
        });
    const { mutate: toggleReplyLike } = useMutation({
        mutationFn: async ({
            replyId,
            index,
        }: {
            replyId: string;
            index: number;
        }) => await likeService.toggleLike(replyId, "reply"),
        onMutate: ({ index }) => {
            queryClient.cancelQueries({
                queryKey: ["comments-like-status", commentId],
            });
            queryClient.cancelQueries({
                queryKey: ["comments-likes-count", commentId],
            });
            queryClient.setQueryData(
                ["comments-like-status", commentId],
                (prev: boolean[]) => {
                    const updatedLikes = [...prev];
                    updatedLikes[index] = !updatedLikes[index];
                    return updatedLikes;
                }
            );
            queryClient.setQueryData(
                ["comments-likes-count", commentId],
                (prev: number[]) => {
                    const updatedLikes = [...prev];
                    updatedLikes[index] += updatedLikes[index] ? -1 : 1;
                    return updatedLikes;
                }
            );
        },
        onError: ({ message }, { index }) => {
            queryClient.cancelQueries({
                queryKey: ["comments-like-status", commentId],
            });
            queryClient.cancelQueries({
                queryKey: ["comments-likes-count", commentId],
            });
            queryClient.setQueryData(
                ["comments-like-status", commentId],
                (prev: boolean[]) => {
                    const updatedLikes = [...prev];
                    updatedLikes[index] = !updatedLikes[index];
                    return updatedLikes;
                }
            );
            queryClient.setQueryData(
                ["comments-likes-count", commentId],
                (prev: number[]) => {
                    const updatedLikes = [...prev];
                    updatedLikes[index] += updatedLikes[index] ? -1 : 1;
                    return updatedLikes;
                }
            );
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
        onError: (error) => {
            toast.error(error.message);
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
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const { mutate: addReply, isPending: isAdditionPending } = useMutation({
        mutationFn: async (content: string) => {
            const data = await replyService.addReply(commentId, content);
            return data.reply;
        },
        onSuccess: () => {
            setReplyingToReplyId(null);
            queryClient.invalidateQueries({
                queryKey: ["replies", commentId],
                exact: true,
            });
            toast.success("Reply added");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const { ref, entry } = useIntersection({
        root: lastReplyRef.current,
        threshold: 1,
    });
    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage) {
            fetchNextPage();
        }
    }, [entry]);
    const processReply = (content: string) => processText(content, playerRef);
    if (repliesLoading || likesCountLoading || likeStatusLoading)
        return (
            <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    return (
        <div className="flex flex-col space-y-2 overflow-y-auto overflow-x-hidden">
            {isDeletionPending && (
                <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            )}
            {replies?.map((reply, index) => {
                return (
                    <div
                        key={index}
                        ref={index === replies.length - 1 ? ref : null}
                    >
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
                                                    `/channel/${reply.creator.username}`
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
                                                            `/channel/${reply.creator.username}`
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
                                                {processReply(reply.content)}
                                            </div>
                                            <div className="flex items-center">
                                                <Button
                                                    onClick={() =>
                                                        toggleReplyLike({
                                                            replyId: reply._id,
                                                            index,
                                                        })
                                                    }
                                                    variant="ghost"
                                                    className="rounded-full p-2"
                                                >
                                                    <ThumbsUp
                                                        fill={
                                                            likeStatusOfReplies?.[
                                                                index
                                                            ]
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
                                                    {likesCountOfReplies[
                                                        index
                                                    ] === 0
                                                        ? ""
                                                        : likesCountOfReplies[
                                                              index
                                                          ]}
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

            <div className="flex items-center justify-center">
                {isFetchingNextPage && (
                    <Loader2 className="h-10 w-10 animate-spin" />
                )}
            </div>
        </div>
    );
};

export default Replies;
