import Axios from "@/lib/axios";

class ReplyService {
    getReplies = async (commentId: string, page: number) =>
        await Axios.get(`/replies/all-replies/${commentId}?page=${page}`);
    addReply = async (commentId: string, content: string) =>
        await Axios.post(`/replies/add-reply/${commentId}`, { content });
    deleteReply = async (replyId: string) =>
        await Axios.delete(`/replies/delete-reply/${replyId}`);
    updateReply = async (replyId: string, content: string) =>
        await Axios.patch(`/replies/update-reply/${replyId}`, { content });
}

export const replyService = new ReplyService();
