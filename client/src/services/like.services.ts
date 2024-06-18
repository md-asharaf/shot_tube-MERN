import Axios from "@/config/request";

class LikeService {
    toggleLike = async (id: string, type: string) =>
        await Axios.post(`/likes/${id}/toggle-${type}-like`);
    isLiked = async (id: string, type: string) =>
        await Axios.get(`/likes/${id}/is-${type}-liked`);
}

export default new LikeService();
