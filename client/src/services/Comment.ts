import Axios from "@/lib/axios";

class CommentService {
    commentsCount = async (id:string,type:string) =>
        await Axios.get(`/comments/comments-count?${type}Id=${id}`)
    getVideoComments = async (videoId: string,page: number,sentiment?:string) =>
        await Axios.get(`/comments/all-video-comments/${videoId}?page=${page}&sentiment=${sentiment}`);
    getShortComments = async (shortId: string,page: number,sentiment?:string) =>
        await Axios.get(`/comments/all-short-comments/${shortId}?page=${page}&sentiment=${sentiment}`);
    commentToVideo = async (videoId: string, content: string) =>
        await Axios.post(`/comments/add-comment-to-video/${videoId}`, { content });
    commentToShort = async (shortId: string, content: string) =>
        await Axios.post(`/comments/add-comment-to-short/${shortId}`, { content });
    deleteComment = async (commentId: string) =>
        await Axios.delete(`/comments/delete-comment/${commentId}`);
    updateComment = async (commentId: string, content: string) =>
        await Axios.patch(`/comments/update-comment/${commentId}`, { content });
}

export default new CommentService();
