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
import { useNavigate } from "react-router-dom";

const Comments = ({ videoId }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const successfull = useSuccess(dispatch);
    const success = useSuccess(dispatch);
    const user = useSelector((state: RootState) => state.auth);
    const [content, setContent] = useState<string>("");
    const fetchComments = async () => {
        const res = await commentServices.getComments(videoId);
        return res.data.docs;
    };
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
    const addCommentMutation = async (content: string) => {
        const res = await commentServices.comment(videoId, content);
        successfull(res);
    };
    const deleteCommentMutation = async (commentId: string) => {
        const res = await commentServices.deleteComment(commentId);
        successfull(res);
    };
    const toggleCommentLikeMutation = async (commentId: string) => {
        const res = await likeServices.toggleLike(commentId, "comment");
        successfull(res);
    };
    const {
        data: comments,
        isError: commentsError,
        isLoading: commentsLoading,
        error: commentsErrorObj,
        refetch: refetchComments,
    } = useQuery<IComment[], Error>({
        queryKey: ["comments", videoId],
        queryFn: fetchComments,
        enabled: !!videoId,
    });

    const {
        data: liked,
        isError: likedError,
        isLoading: likedLoading,
        error: likedErrorObj,
        refetch: refetchCommentsLike,
    } = useQuery<boolean[], Error>({
        queryKey: ["commentsLike", videoId],
        queryFn: fetchCommentsLike,
        enabled: !!comments, // Ensure this query runs only when `comments` is available
    });

    const { mutate: addComment } = useMutation<void, Error, string>({
        mutationFn: addCommentMutation,
        onSuccess: () => {
            setContent("");
            refetchComments();
        },
        onError: (error: Error) => {
            console.error("Error adding comment:", error);
        },
    });

    const { mutate: toggleCommentLike } = useMutation<void, Error, string>({
        mutationFn: toggleCommentLikeMutation,
        onSuccess: () => {
            refetchCommentsLike();
        },
        onError: (error) => {
            console.error("Error toggling comment like:", error);
        },
    });

    const { mutate: deleteComment } = useMutation<void, Error, string>({
        mutationFn: deleteCommentMutation,
        onSuccess: () => {
            refetchComments();
        },
        onError: (error: Error) => {
            console.error("Error deleting comment:", error);
        },
    });

    if (commentsLoading || likedLoading) return <div>Loading...</div>;
    if (commentsError || likedError)
        return (
            <div>
                ERROR: {commentsErrorObj?.message || likedErrorObj?.message}
            </div>
        );

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
                            }}
                            variant="destructive"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!content}
                            onClick={() => addComment(content)}
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
                                className="rounded-full h-10 w-10 cursor-pointer"
                                onClick={() =>
                                    navigate(
                                        `/${comment.creator.username}/channel`
                                    )
                                }
                            />
                            <div>
                                <div>
                                    <span
                                        onClick={() =>
                                            navigate(
                                                `/${comment.creator.username}/channel`
                                            )
                                        }
                                        className="text-[16px] cursor-pointer"
                                    >{`@${comment.creator.username} `}</span>
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
                                                toggleCommentLike(comment._id)
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
                                                    deleteComment(comment._id)
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
