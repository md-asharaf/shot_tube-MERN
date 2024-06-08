import Axios from "@/config/request";

class CommentService {
    getComments = async (videoId: string) =>
        await Axios.get(`/comments/${videoId}`);
    comment = async (videoId: string, content: string) =>
        await Axios.post(`/comments/${videoId}/add`, { content });
    deleteComment = async (commentId: string) =>
        await Axios.delete(`/comments/${commentId}/delete`);
}

export default new CommentService();
