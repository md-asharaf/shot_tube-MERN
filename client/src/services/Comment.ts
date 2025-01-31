import Axios from "@/lib/axios";

class CommentService {
    getComments = async (videoId: string,page: number,sentiment?:string) =>
        await Axios.get(`/comments/all-comments/${videoId}?page=${page}&sentiment=${sentiment}`);
    comment = async (videoId: string, content: string) =>
        await Axios.post(`/comments/add-comment/${videoId}`, { content });
    deleteComment = async (commentId: string) =>
        await Axios.delete(`/comments/delete-comment/${commentId}`);
    updateComment = async (commentId: string, content: string) =>
        await Axios.patch(`/comments/update-comment/${commentId}`, { content });
}

export default new CommentService();
