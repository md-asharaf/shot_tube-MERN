import axios from "@/lib/axios";

class LikeService {
    likesCount = async (id: string, type: string) =>
        await axios.get(`/likes/likes-count?${type}Id=${id}`);
    toggleLike = async (id: string, type: string) =>
        await axios.post(`/likes/toggle-${type}-like/${id}`);
    isLiked = async (id: string, type: string) =>
        await axios.get(`/likes/is-liked?${type}Id=${id}`);
    getCommentsLikeStatus = async (id: string, type: string) =>
        await axios.get(`/likes/${type}-comments-like-status/${id}`);
    getRepliesLikeStatus = async (id: string) =>
        await axios.get(`/likes/comment-replies-like-status/${id}`);
    getRepliesLikesCount = async (id: string) =>
        await axios.get(`/likes/comment-replies-likes-count/${id}`);
    getCommentsLikesCount = async (id: string, type: string) =>
        await axios.get(`/likes/${type}-comments-likes-count/${id}`);
}

export const likeService = new LikeService();
