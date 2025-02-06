import Axios from "@/lib/axios";

class LikeService {
    likesCount = async (id:string,type:string) =>
        await Axios.get(`/likes/likes-count?${type}Id=${id}`)
    toggleLike = async (id: string, type: string) =>
        await Axios.post(`/likes/toggle-${type}-like/${id}`);
    isLiked = async (id: string, type: string) =>
        await Axios.get(`/likes/is-liked?${type}Id=${id}`);
    getVideoCommentsLike = async (id: string) =>
        await Axios.get(`/likes/video-comments-like/${id}`);
    getShortCommentsLike = async (id: string) =>
        await Axios.get(`/likes/short-comments-like/${id}`);
    getCommentRepliesLike = async (id: string) =>
        await Axios.get(`/likes/comment-replies-like/${id}`);
}

export default new LikeService();
