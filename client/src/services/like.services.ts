import Axios from "@/config/request";

class LikeService {
    toggleVideoLike = async (videoId: string) =>
        await Axios.post(`/likes/${videoId}/toggle-video-like`);
    toggleCommentLike = async (commentId: string) =>
        await Axios.post(`/likes/${commentId}/toggle-comment-like`);
    toggleTweetLike = async (tweetId: string) =>
        await Axios.post(`/likes/${tweetId}/toggle-tweet-like`);
    isLiked = async (id: string, type: string) =>
        await Axios.get(`/likes/${id}/is-${type}-liked`);
}

export default new LikeService();
