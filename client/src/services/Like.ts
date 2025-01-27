import Axios from "@/lib/axios";

class LikeService {
    toggleLike = async (id: string, type: string) =>
        await Axios.post(`/likes/toggle-${type}-like/${id}`);
    isLiked = async (id: string, type: string) =>
        await Axios.get(`/likes/is-${type}-liked/${id}`);
    getVideoCommentsLike = async (id: string) =>
        await Axios.get(`/likes/video-comments-like/${id}`);
    getCommentRepliesLike = async (id: string) =>
        await Axios.get(`/likes/comment-replies-like/${id}`);
}

export default new LikeService();
