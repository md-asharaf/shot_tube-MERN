import axios from "@/lib/axios";

class ReplyService {
    getReplies = async (commentId: string, page: number) =>
        await axios.get(`/replies/all-replies/${commentId}?page=${page}`);
    addReply = async (commentId: string, content: string) =>
        await axios.post(`/replies/add-reply/${commentId}`, { content });
    deleteReply = async (replyId: string) =>
        await axios.delete(`/replies/delete-reply/${replyId}`);
    updateReply = async (replyId: string, content: string) =>
        await axios.patch(`/replies/update-reply/${replyId}`, { content });
}

export const replyService = new ReplyService();
