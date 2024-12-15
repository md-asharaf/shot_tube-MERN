import Axios from "@/config/request";

class CommentService {
    getComments = async (videoId: string) =>
        await Axios.get(`/comments/all-comments/${videoId}`);
    comment = async (videoId: string, content: string) =>
        await Axios.post(`/comments/add-comment/${videoId}`, { content });
    deleteComment = async (commentId: string) =>
        await Axios.delete(`/comments/delete-comment/${commentId}`);
}

export default new CommentService();
