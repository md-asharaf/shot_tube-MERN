import Axios from "@/lib/axios";

class CommentService {
    commentsCount = async (id: string, type: string) =>
        await Axios.get(`/comments/comments-count?${type}Id=${id}`);
    getComments = async (
        id: string,
        page: number,
        type: string,
        sentiment: string,
    ) =>
        await Axios.get(
            `/comments/all-${type}-comments/${id}?page=${page}&sentiment=${sentiment}`
        );
    comment = async (id: string, content: string, type: string) =>
        await Axios.post(`/comments/add-comment-to-${type}/${id}`, { content });
    deleteComment = async (commentId: string) =>
        await Axios.delete(`/comments/delete-comment/${commentId}`);
    updateComment = async (commentId: string, content: string) =>
        await Axios.patch(`/comments/update-comment/${commentId}`, { content });
}

export default new CommentService();
