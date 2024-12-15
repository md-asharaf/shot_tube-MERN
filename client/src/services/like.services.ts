import Axios from "@/config/request";

class LikeService {
    toggleLike = async (id: string, type: string) =>
        await Axios.post(`/likes/toggle-${type}-like/${id}`);
    isLiked = async (id: string, type: string) =>
        await Axios.get(`/likes/is-${type}-liked/${id}`);
}

export default new LikeService();
