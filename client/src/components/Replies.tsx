import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import replyService from "@/services/Reply";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EllipsisVertical, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DefaultProfileImage from "@/assets/images/profile.png";
import { formatDistanceToNowStrict } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
interface Reply {
    _id: string;
    content: string;
    userId: {
        name: string;
        avatar: string;
    };
    createdAt: string;
}

const Replies = ({ commentId }: { commentId: string }) => {
    const userData = useSelector((state: RootState) => state.auth?.userData);
    const navigate = useNavigate();
    const {
        data: replies = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["replies", commentId],
        queryFn: async () => {
            const data = await replyService.getReplies(commentId);
            return data.replies;
        },
    });

    const { mutate: deleteReply, isPending: isDeletionPending } = useMutation({
        mutationFn: async (replyId: string) => await replyService.deleteReply(replyId),
        onSuccess: () => {
            refetch();
        },
    });

    const { mutate: updateReply, isPending: isUpdationPending } = useMutation({
        mutationFn: async ({
            replyId,
            content,
        }: {
            replyId: string;
            content: string;
        }) => await replyService.updateReply(replyId, content),
        onSuccess: () => {
            refetch();
        },
    });

    if (isLoading) return null;

    return (
        <div className="flex flex-col mt-2 space-y-2 overflow-y-auto overflow-x-hidden">
            {replies?.map((reply, index) => {
                return (
                    <div key={index} className="flex justify-between">
                        <div className="flex space-x-2 items-start">
                            <img
                                src={
                                    reply.userId.avatar || DefaultProfileImage
                                }
                                className="rounded-full h-6 w-6 cursor-pointer"
                                onClick={() =>
                                    navigate(
                                        `/${reply.userId.username}/channel`,
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
                                                `/${reply.userId.username}/channel`,
                                                {
                                                    viewTransition: true,
                                                }
                                            )
                                        }
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        {`@${reply.userId.username} `}
                                    </div>
                                    <div className="text-gray-500 dark:text-zinc-400 text-[12px]">
                                        {formatDistanceToNowStrict(
                                            new Date(reply.createdAt),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </div>
                                </div>
                                <div className="break-words whitespace-pre-wrap">
                                    {reply.content}
                                </div>
                                {/* {userData && (
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
                        )} */}
                            </div>
                        </div>
                        {/* {userData?._id === comment.creator._id && (
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
                )} */}
                    </div>
                );
            })}
            {/* <div
        className="h-10 flex items-center justify-center"
        ref={getRef}
    >
        {isFetchingNextPage && (
            <Loader2 className="h-10 w-10 animate-spin" />
        )}
    </div> */}
        </div>
    );
};

export default Replies;
