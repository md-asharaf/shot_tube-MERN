import { RootState } from "@/provider";
import commentServices from "@/services/comment.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DefaultProfileImage from "@/assets/images/profile.png";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";
import likeServices from "@/services/like.services";
import { useSuccess } from "@/lib/utils";
import { BiLike } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IComment } from "@/interfaces";
const Comments = ({ videoId }) => {
    const dispatch = useDispatch();
    const success = useSuccess(dispatch);
    const user = useSelector((state: RootState) => state.auth);
    const [content, setContent] = useState<string>("");
    const fetchComments = async (): Promise<IComment[]> => {
        const res = await commentServices.getComments(videoId);
        return res.data.docs;
    };
    const {
        data: comments,
        isError,
        isLoading,
        error,
        refetch: refetchComments,
    } = useQuery({
        queryKey: ["comments", videoId],
        queryFn: fetchComments,
    });
    const fetchCommentsLike = async () => {
        const likes: boolean[] = await Promise.all(
            comments.map(async (comment) => {
                const res = await likeServices.isLiked(comment._id, "comment");
                if (success(res)) {
                    return res.data;
                }
            })
        );
        return likes;
    };
    const {
        data: liked,
        refetch: refetchCommentsLike,
        isError: is_Error,
        error: error_Like,
        isLoading: is_Loading,
    } = useQuery({
        queryKey: ["commentsLike"],
        queryFn: fetchCommentsLike,
    });
    const toggleCommentLike = async (commentId: string) => {
        const res = await likeServices.toggleCommentLike(commentId);
        if (success(res)) {
            refetchCommentsLike();
        }
    };
    const deleteComment = async (commentId: string) => {
        const res = await commentServices.deleteComment(commentId);
        if (success(res)) {
            refetchComments();
        }
    };
    const addComment = async () => {
        const res = await commentServices.comment(videoId, content);
        if (success(res)) {
            setContent("");
            refetchComments();
        }
    };
    const toggleCommentLikeMutation = useMutation({
        mutationKey: ["toggleCommentLike"],
        mutationFn: toggleCommentLike,
    });
    const addCommentMutation = useMutation({
        mutationFn: addComment,
        mutationKey: ["addComment"],
    });
    const deleteCommentMutation = useMutation({
        mutationKey: ["deleteComment"],
        mutationFn: deleteComment,
    });

    if (isLoading || is_Loading) return <div>Loading...</div>;
    if (isError || is_Error)
        return <div>ERROR: {error?.message || error_Like.message}</div>;
    return (
        <>
            <div className="font-bold text-2xl text-zinc-600">{`${comments.length} Comments`}</div>
            <div className="flex flex-col">
                <div className="flex gap-x-2 items-center justify-start">
                    <img
                        src={user.userData?.avatar?.url || DefaultProfileImage}
                        className="rounded-full h-10 w-10"
                    />
                    <Input
                        disabled={!user.status}
                        // onFocus={() => setCancelCommentButton(true)}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a public comment..."
                        className="border-none shadow-none"
                    />
                    <div className="flex space-x-2">
                        <Button
                            disabled={!content}
                            onClick={() => {
                                setContent("");
                                // setCancelCommentButton(false);
                            }}
                            variant="destructive"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!content}
                            onClick={() => addCommentMutation.mutate()}
                            variant="outline"
                            className="hover:bg-blue-500 hover:text-white"
                        >
                            Comment
                        </Button>
                    </div>
                </div>
                <div className="w-full border-b-2 border-gray-300 mb-8 mt-4"></div>

                <div className="flex flex-col space-y-4">
                    {comments.map((comment, index) => (
                        <div key={index} className="flex space-x-4 items-start">
                            <img
                                src={
                                    comment.creator.avatar?.url ||
                                    DefaultProfileImage
                                }
                                className="rounded-full h-10 w-10"
                            />
                            <div>
                                <div>
                                    <span className="text-[16px]">{`@${comment.creator.username} `}</span>
                                    <span className="text-gray-500 font-light text-[13px]">
                                        {formatDistanceToNow(
                                            new Date(comment.createdAt),
                                            { addSuffix: true }
                                        ).replace("about ", "")}
                                    </span>
                                </div>
                                <div>{comment.content}</div>
                                {user.status && (
                                    <div className="space-x-2 flex items-center">
                                        <Button
                                            onClick={() =>
                                                toggleCommentLikeMutation.mutate(
                                                    comment._id
                                                )
                                            }
                                            variant="ghost"
                                            className={`rounded-full text-lg p-2 ${
                                                liked[index] && "text-blue-500"
                                            }`}
                                        >
                                            <BiLike />
                                        </Button>
                                        {user.userData.username ===
                                            comment.creator.username && (
                                            <Button
                                                onClick={() =>
                                                    deleteCommentMutation.mutate(
                                                        comment._id
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
        </>
    );
};

export default Comments;
