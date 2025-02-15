import Axios from "@/lib/axios";

class LikeService {
    likesCount = async (id: string, type: string) =>
        await Axios.get(`/likes/likes-count?${type}Id=${id}`);
    toggleLike = async (id: string, type: string) =>
        await Axios.post(`/likes/toggle-${type}-like/${id}`);
    isLiked = async (id: string, type: string) =>
        await Axios.get(`/likes/is-liked?${type}Id=${id}`);
    getCommentsLikeStatus = async (id: string, type: string) =>
        await Axios.get(`/likes/${type}-comments-like-status/${id}`);
    getRepliesLikeStatus = async (id: string) =>
        await Axios.get(`/likes/comment-replies-like-status/${id}`);
    getRepliesLikesCount = async (id: string) =>
        await Axios.get(`/likes/comment-replies-likes-count/${id}`);
    getCommentsLikesCount = async (id: string, type: string) =>
        await Axios.get(`/likes/${type}-comments-likes-count/${id}`);
}

export const likeService = new LikeService();
