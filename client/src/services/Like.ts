import Axios from "@/lib/axios";

class LikeService {
    toggleLike = async (id: string, type: string) =>
        await Axios.post(`/likes/toggle-${type}-like/${id}`);
    isLiked = async (id: string, type: string) =>
        await Axios.get(`/likes/is-${type}-liked/${id}`);
    getIsLikedOfVideoComments = async (id: string) =>
        await Axios.get(`/likes/is-video-comment-liked/${id}`);
}

export default new LikeService();
