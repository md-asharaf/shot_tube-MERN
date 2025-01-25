import Axios from "@/lib/axios";

class CommentService {
    getComments = async (videoId: string,page: number) =>
        await Axios.get(`/comments/all-comments/${videoId}?page=${page}`);
    comment = async (videoId: string, content: string) =>
        await Axios.post(`/comments/add-comment/${videoId}`, { content });
    deleteComment = async (commentId: string) =>
        await Axios.delete(`/comments/delete-comment/${commentId}`);
}

export default new CommentService();
